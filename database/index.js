// database/index.js - Multi-DB: MongoDB | PostgreSQL | Local JSON
// Auto-détection: MONGODB_URI > DATABASE_URL > Local

const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// ── DETECT ──────────────────────────────────────────────────────────────────
function detectDBMode() {
  if (process.env.MONGODB_URI)  return 'mongodb';
  if (process.env.DATABASE_URL) return 'postgresql';
  return 'local';
}
const DB_MODE = detectDBMode();
let _db = null; // PG client

// ── LOCAL JSON ───────────────────────────────────────────────────────────────
const LOCAL_DIR = path.join(__dirname, '../local_db');
function localRead(file) {
  const p = path.join(LOCAL_DIR, file + '.json');
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return {}; }
}
function localWrite(file, data) {
  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(path.join(LOCAL_DIR, file + '.json'), JSON.stringify(data, null, 2));
}
function localGet(file, key)        { return localRead(file)[key] ?? null; }
function localSet(file, key, value) { const d = localRead(file); d[key] = value; localWrite(file, d); }

// ── DEFAULTS ─────────────────────────────────────────────────────────────────
function defaultGroup(jid) {
  return {
    jid, name: '', antilink: false, antilinkAction: 'delete',
    antibot: false, antidelete: false, antitag: false,
    antiviewonce: false, antiflood: false, antifloodMax: 5,
    antibadword: false, badWords: [],
    welcome: false, welcomeMsg: null,
    goodbye: false, goodbyeMsg: null,
    mute: false, language: config.LANGUAGE,
    nsfw: false, chatbot: false, autotyping: true,
    warns: {}, banned: [], rules: null,
    antipromote: false,
    antidemote: false,
    antiedit: false,
    groupevents: false,
    antigroupmention: false
  };
}
function defaultUser(jid) {
  return {
    jid, name: '', banned: false, warns: 0,
    afk: false, afkReason: null, afkTime: null,
    xp: 0, level: 1, coins: 0, lastDaily: null, inventory: []
  };
}

// ── MONGODB ───────────────────────────────────────────────────────────────────
let mongoose, Group, User, BotData, Deploy, CmdCount;

async function connectMongoDB() {
  mongoose = require('mongoose');
  const S = mongoose.Schema;

  Group = mongoose.models.Group || mongoose.model('Group', new S({
    jid: { type: String, required: true, unique: true },
    name: String,
    antilink: { type: Boolean, default: false },
    antilinkAction: { type: String, default: 'delete' },
    antibot: { type: Boolean, default: false },
    antidelete: { type: Boolean, default: false },
    antitag: { type: Boolean, default: false },
    antiviewonce: { type: Boolean, default: false },
    antiflood: { type: Boolean, default: false },
    antifloodMax: { type: Number, default: 5 },
    antibadword: { type: Boolean, default: false },
    badWords: [String],
    welcome: { type: Boolean, default: false },
    welcomeMsg: String,
    goodbye: { type: Boolean, default: false },
    goodbyeMsg: String,
    mute: { type: Boolean, default: false },
    language: { type: String, default: config.LANGUAGE },
    nsfw: { type: Boolean, default: false },
    chatbot: { type: Boolean, default: false },
    autotyping: { type: Boolean, default: true },
    warns: { type: Map, of: Number, default: {} },
    banned: [String],
    rules: String,
    antipromote: { type: Boolean, default: false },
    antidemote:  { type: Boolean, default: false },
    antiedit:    { type: mongoose.Schema.Types.Mixed, default: false },
    groupevents: { type: Boolean, default: false },
    antigroupmention: { type: mongoose.Schema.Types.Mixed, default: false },
    createdAt: { type: Date, default: Date.now }
  }));

  User = mongoose.models.User || mongoose.model('User', new S({
    jid: { type: String, required: true, unique: true },
    name: String,
    banned: { type: Boolean, default: false },
    warns: { type: Number, default: 0 },
    afk: { type: Boolean, default: false },
    afkReason: String, afkTime: Date,
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    coins: { type: Number, default: 0 },
    lastDaily: Date, inventory: [String],
    createdAt: { type: Date, default: Date.now }
  }));

  BotData  = mongoose.models.BotData  || mongoose.model('BotData',  new S({ key: { type: String, required: true, unique: true }, value: S.Types.Mixed }));
  Deploy   = mongoose.models.Deploy   || mongoose.model('Deploy',   new S({ userId: String, sessionId: String, platform: String, deployUrl: String, status: { type: String, default: 'active' }, ownerNumber: String, createdAt: { type: Date, default: Date.now } }));
  CmdCount = mongoose.models.CmdCount || mongoose.model('CmdCount', new S({ count: { type: Number, default: 0 } }));

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ MongoDB connected!');
}

// ── POSTGRESQL ────────────────────────────────────────────────────────────────
async function connectPostgreSQL() {
  const { Client } = require('pg');
  _db = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await _db.connect();

  await _db.query(`
    CREATE TABLE IF NOT EXISTS groups   (jid TEXT PRIMARY KEY, data JSONB NOT NULL DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS users    (jid TEXT PRIMARY KEY, data JSONB NOT NULL DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS botdata  (key TEXT PRIMARY KEY, value JSONB);
    CREATE TABLE IF NOT EXISTS deploys  (
      id SERIAL PRIMARY KEY, user_id TEXT, session_id TEXT,
      platform TEXT, deploy_url TEXT, status TEXT DEFAULT 'active',
      owner_number TEXT, created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS cmdcount (id INT PRIMARY KEY DEFAULT 1, count INT DEFAULT 0);
    INSERT INTO cmdcount(id,count) VALUES(1,0) ON CONFLICT DO NOTHING;
  `);
  console.log('✅ PostgreSQL (Render) connected!');
}

// ── CONNECT ───────────────────────────────────────────────────────────────────
async function connectDB() {
  console.log(`🗄️  DB mode: ${DB_MODE.toUpperCase()}`);
  try {
    if (DB_MODE === 'mongodb')    await connectMongoDB();
    if (DB_MODE === 'postgresql') await connectPostgreSQL();
    if (DB_MODE === 'local') {
      if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
      console.log('✅ Local JSON storage ready!');
      console.log('   ℹ️  Add MONGODB_URI or DATABASE_URL to use a real database.');
    }
    return true;
  } catch (e) {
    console.error(`❌ DB connect failed (${DB_MODE}):`, e.message);
    console.warn('⚠️  Falling back to local JSON storage...');
    return false;
  }
}

// ── HELPERS: save() factory ───────────────────────────────────────────────────
function pgSaver(table, jid, obj) {
  return async () => {
    const { save, ...data } = obj;
    await _db.query(`UPDATE ${table} SET data=$1 WHERE jid=$2`, [data, jid]);
  };
}
function localSaver(table, jid, obj) {
  return () => {
    const store = localRead(table);
    const { save, ...data } = obj;
    store[jid] = data;
    localWrite(table, store);
  };
}

// ── getGroup ──────────────────────────────────────────────────────────────────
async function getGroup(jid) {
  if (DB_MODE === 'mongodb') {
    let g = await Group.findOne({ jid });
    if (!g) g = await Group.create({ jid });
    return g;
  }
  if (DB_MODE === 'postgresql') {
    let res = await _db.query('SELECT data FROM groups WHERE jid=$1', [jid]);
    if (!res.rows.length) {
      await _db.query('INSERT INTO groups(jid,data) VALUES($1,$2)', [jid, defaultGroup(jid)]);
      res = await _db.query('SELECT data FROM groups WHERE jid=$1', [jid]);
    }
    const g = { ...defaultGroup(jid), ...res.rows[0].data };
    g.save = pgSaver('groups', jid, g);
    return g;
  }
  // Local
  const store = localRead('groups');
  if (!store[jid]) { store[jid] = defaultGroup(jid); localWrite('groups', store); }
  const g = { ...defaultGroup(jid), ...store[jid] };
  g.save = localSaver('groups', jid, g);
  return g;
}

// ── getUser ───────────────────────────────────────────────────────────────────
async function getUser(jid) {
  if (DB_MODE === 'mongodb') {
    let u = await User.findOne({ jid });
    if (!u) u = await User.create({ jid });
    return u;
  }
  if (DB_MODE === 'postgresql') {
    let res = await _db.query('SELECT data FROM users WHERE jid=$1', [jid]);
    if (!res.rows.length) {
      await _db.query('INSERT INTO users(jid,data) VALUES($1,$2)', [jid, defaultUser(jid)]);
      res = await _db.query('SELECT data FROM users WHERE jid=$1', [jid]);
    }
    const u = { ...defaultUser(jid), ...res.rows[0].data };
    u.save = pgSaver('users', jid, u);
    return u;
  }
  const store = localRead('users');
  if (!store[jid]) { store[jid] = defaultUser(jid); localWrite('users', store); }
  const u = { ...defaultUser(jid), ...store[jid] };
  u.save = localSaver('users', jid, u);
  return u;
}

// ── getBotData / setBotData ───────────────────────────────────────────────────
async function getBotData(key) {
  if (DB_MODE === 'mongodb') { const d = await BotData.findOne({ key }); return d ? d.value : null; }
  if (DB_MODE === 'postgresql') { const r = await _db.query('SELECT value FROM botdata WHERE key=$1', [key]); return r.rows[0]?.value ?? null; }
  return localGet('botdata', key);
}
async function setBotData(key, value) {
  if (DB_MODE === 'mongodb') { await BotData.findOneAndUpdate({ key }, { value }, { upsert: true, new: true }); return; }
  if (DB_MODE === 'postgresql') { await _db.query('INSERT INTO botdata(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=$2', [key, value]); return; }
  localSet('botdata', key, value);
}

// ── totalcmds / incrementCmds ─────────────────────────────────────────────────
async function totalcmds() {
  if (DB_MODE === 'mongodb') { let d = await CmdCount.findOne(); return d ? d.count : 0; }
  if (DB_MODE === 'postgresql') { const r = await _db.query('SELECT count FROM cmdcount WHERE id=1'); return r.rows[0]?.count || 0; }
  return localGet('botdata', 'cmdcount') || 0;
}
async function incrementCmds() {
  if (DB_MODE === 'mongodb') { await CmdCount.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true }); return; }
  if (DB_MODE === 'postgresql') { await _db.query('UPDATE cmdcount SET count=count+1 WHERE id=1'); return; }
  localSet('botdata', 'cmdcount', (localGet('botdata', 'cmdcount') || 0) + 1);
}

// ── warnUser / resetWarn ──────────────────────────────────────────────────────
async function warnUser(jid, groupJid) {
  const g = await getGroup(groupJid);
  if (!g.warns) g.warns = {};
  g.warns[jid] = (g.warns[jid] || 0) + 1;
  await g.save();
  return g.warns[jid];
}
async function resetWarn(jid, groupJid) {
  const g = await getGroup(groupJid);
  if (g.warns) { g.warns[jid] = 0; await g.save(); }
}

// ── addXP ─────────────────────────────────────────────────────────────────────
async function addXP(jid, amount) {
  const u = await getUser(jid);
  u.xp = (u.xp || 0) + amount;
  const newLevel = Math.floor(0.1 * Math.sqrt(u.xp));
  const leveledUp = newLevel > (u.level || 1);
  u.level = Math.max(u.level || 1, newLevel);
  await u.save();
  return { xp: u.xp, level: u.level, leveledUp };
}

// ── Deploy ────────────────────────────────────────────────────────────────────
async function getDeployCount() {
  if (DB_MODE === 'mongodb') return await Deploy.countDocuments({ status: 'active' });
  if (DB_MODE === 'postgresql') { const r = await _db.query("SELECT COUNT(*) FROM deploys WHERE status='active'"); return parseInt(r.rows[0].count); }
  return Object.values(localRead('deploys')).filter(x => x.status === 'active').length;
}
async function addDeploy(data) {
  if (DB_MODE === 'mongodb') return await Deploy.create(data);
  if (DB_MODE === 'postgresql') {
    await _db.query('INSERT INTO deploys(user_id,session_id,platform,deploy_url,status,owner_number) VALUES($1,$2,$3,$4,$5,$6)',
      [data.userId, data.sessionId, data.platform, data.deployUrl, data.status || 'active', data.ownerNumber]);
    return data;
  }
  const d = localRead('deploys');
  const id = Date.now().toString();
  d[id] = { ...data, id, createdAt: new Date().toISOString() };
  localWrite('deploys', d);
  return d[id];
}
async function getUserDeploys(userId) {
  if (DB_MODE === 'mongodb') return await Deploy.find({ userId, status: 'active' });
  if (DB_MODE === 'postgresql') { const r = await _db.query("SELECT * FROM deploys WHERE user_id=$1 AND status='active'", [userId]); return r.rows; }
  return Object.values(localRead('deploys')).filter(x => x.userId === userId && x.status === 'active');
}
async function getAllDeploys() {
  if (DB_MODE === 'mongodb') return await Deploy.find({ status: 'active' });
  if (DB_MODE === 'postgresql') { const r = await _db.query("SELECT * FROM deploys WHERE status='active'"); return r.rows; }
  return Object.values(localRead('deploys')).filter(x => x.status === 'active');
}

// ── EXPORTS ───────────────────────────────────────────────────────────────────
module.exports = {
  DB_MODE, connectDB,
  getGroup, getUser, getBotData, setBotData,
  totalcmds, incrementCmds,
  warnUser, resetWarn, addXP,
  getDeployCount, addDeploy, getUserDeploys, getAllDeploys,
  getPG: () => _db
};
