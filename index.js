require('dotenv').config();
const {
  makeWASocket, useMultiFileAuthState, DisconnectReason,
  fetchLatestBaileysVersion, makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino    = require('pino');
const path    = require('path');
const fs      = require('fs');
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const config  = require('./config/config');
const db      = require('./database');
const { downloadSessionData } = require('./lib/session');
const { sms, getNewsletterContext, formatUptime } = require('./lib/msg');
const { loadCommands, getCommand, getTotalCount } = require('./lib/loader');
const {
  handleParticipantUpdate, handleMessageProtection,
  handleMessageDelete, handleMessageEdit,
  handleStatusMessage, handleNewsletterReaction,
  handleAntiCall, updateAutoBio,
  cacheMessage
} = require('./lib/events');
const { resolveLid, seedLidFromMeta, jidToNumber } = require('./lib/lid');
const { t } = require('./lib/lang');
const { checkUpdate, downloadAndApplyUpdate, getLocalVersion } = require('./lib/updater');

// ── MULTI-SESSION STORE ───────────────────────────────────────────────────────
const activeSessions = new Map();
const AUTH_BASE = path.join(__dirname, 'auth');
const CMDS_DIR  = path.join(__dirname, 'cmds');

// ── EXPRESS ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.get('/',        (_, res) => res.json({ status: 'online', bot: config.BOT_NAME, version: getLocalVersion(), sessions: activeSessions.size, commands: getTotalCount() }));
app.get('/health',  (_, res) => res.json({ status: 'ok' }));
app.get('/sessions',(_, res) => res.json({ count: activeSessions.size, sessions: [...activeSessions.keys()] }));
app.listen(process.env.PORT || 3000, () => console.log(`🌐 Server on port ${process.env.PORT || 3000}`));

// ── UNKNOWN COMMAND RESPONSES ─────────────────────────────────────────────────
const unknownMsgs = [
  (cmd, p) => `❓ Unknown command: *${p}${cmd}*\nType *${p}menu* to see all commands.`,
  (cmd, p) => `🤔 *${p}${cmd}* doesn't exist!\nUse *${p}help* for the command list.`,
  (cmd, p) => `🚫 *${p}${cmd}* not found.\n💡 Try *${p}menu* to browse commands.`,
  (cmd, p) => `❌ *${p}${cmd}* is not valid.\n📋 See *${p}menu* for all commands.`,
];
const unknownMsg = (cmd, p) => unknownMsgs[Math.floor(Math.random() * unknownMsgs.length)](cmd, p);

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function startBot() {
  await db.connectDB();

  // Load saved settings
  const savedLang   = await db.getBotData('language').catch(() => null);
  const savedPrefix = await db.getBotData('prefix').catch(() => null);
  const savedName   = await db.getBotData('botname').catch(() => null);
  if (savedLang)            config.LANGUAGE = savedLang;
  if (savedPrefix !== null) { config.PREFIX = savedPrefix; global.BOT_PREFIX = savedPrefix; }
  if (savedName)            config.BOT_NAME = savedName;
  global.BOT_PREFIX = config.PREFIX;

  loadCommands(CMDS_DIR);
  console.log(`📦 Commands: ${getTotalCount()} | DB: ${db.DB_MODE.toUpperCase()} | Prefix: ${config.PREFIX ?? '(none)'}`);

  // Session download / QR fallback
  const mainAuth = path.join(AUTH_BASE, 'main');
  if (!fs.existsSync(path.join(mainAuth, 'creds.json'))) {
    if (config.SESSION_ID) {
      const ok = await downloadSessionData(config.SESSION_ID, mainAuth);
      if (!ok) console.warn('⚠️  Session failed — QR mode activated.');
    } else {
      console.warn('⚠️  No SESSION_ID — QR mode activated.');
    }
  }

  await startSession('main', mainAuth, config);

  // Auto-update check every 6h
  setInterval(async () => {
    const { hasUpdate, local, remote } = await checkUpdate();
    if (!hasUpdate) return;
    const sock = activeSessions.get('main')?.sock;
    const ownerJid = config.OWNER_NUMBER?.replace(/[^0-9]/g,'') + '@s.whatsapp.net';
    if (sock) sock.sendMessage(ownerJid, { text: `🔔 *Update Available!*\n📦 ${local} → ${remote}\n\nType *.update now* to update.` }).catch(() => {});
  }, 6 * 60 * 60 * 1000);

  // Auto-bio every 30 min
  setInterval(async () => {
    const sock = activeSessions.get('main')?.sock;
    if (sock) updateAutoBio(sock).catch(() => {});
  }, 30 * 60 * 1000);
}

// ── START SESSION ─────────────────────────────────────────────────────────────
async function startSession(sessionId, authDir, sessionConfig, retryCount = 0) {
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['INCONNU XD V3', 'Chrome', '3.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true
  });

  activeSessions.set(sessionId, { sock, config: sessionConfig, number: null, retryCount });
  sock.ev.on('creds.update', saveCreds);

  // ── CONNECTION ───────────────────────────────────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log(`\n📱 [${sessionId}] SCAN QR TO CONNECT\n`);
      // Send QR image to owner if already connected before
      const session = activeSessions.get(sessionId);
      if (session?.number) {
        try {
          const QRCode = require('qrcode');
          const qrBuf = await QRCode.toBuffer(qr, { type: 'png', width: 512 });
          const ownerJid = sessionConfig.OWNER_NUMBER?.replace(/[^0-9]/g,'') + '@s.whatsapp.net';
          await sock.sendMessage(ownerJid, { image: qrBuf, caption: `📱 *[${sessionId}]* Reconnect QR Code` });
        } catch {}
      }
    }

    if (connection === 'open') {
      const botNum = sock.user?.id?.split(':')[0];
      activeSessions.get(sessionId).number = botNum;
      console.log(`✅ [${sessionId}] Connected: ${botNum}`);
      if (sessionId === 'main') {
        const ownerJid = sessionConfig.OWNER_NUMBER?.replace(/[^0-9]/g,'') + '@s.whatsapp.net';
        sock.sendMessage(ownerJid, {
          text: `✅ *${sessionConfig.BOT_NAME}* online!\n📦 Cmds: ${getTotalCount()}\n🗄️ DB: ${db.DB_MODE.toUpperCase()}\n⚡ Prefix: *${sessionConfig.PREFIX ?? '(none)'}*\n📱 Sessions: ${activeSessions.size}`
        }).catch(() => {});
        // Initial auto-bio
        updateAutoBio(sock).catch(() => {});
      }
    }

    if (connection === 'close') {
      const code     = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      const retries  = activeSessions.get(sessionId)?.retryCount || 0;
      if (!loggedOut && retries < 10) {
        const delay = Math.min(1000 * 2 ** retries, 30000);
        console.log(`🔄 [${sessionId}] Reconnect in ${delay/1000}s (${retries+1}/10)`);
        activeSessions.get(sessionId).retryCount = retries + 1;
        setTimeout(() => startSession(sessionId, authDir, sessionConfig, retries + 1), delay);
      } else if (loggedOut) {
        activeSessions.delete(sessionId);
        try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
        if (sessionId === 'main') setTimeout(() => startSession(sessionId, path.join(AUTH_BASE,'main'), config, 0), 3000);
      } else {
        activeSessions.delete(sessionId);
        if (sessionId === 'main') process.exit(1);
      }
    }
  });

  // ── CALLS (anticall) ──────────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    handleAntiCall(sock, calls, sessionConfig).catch(() => {});
  });

  // ── GROUP PARTICIPANTS ────────────────────────────────────────────────────
  sock.ev.on('group-participants.update', async (update) => {
    handleParticipantUpdate(sock, update, db).catch(e => console.error('[participants]', e.message));
  });

  // ── ANTIDELETE ────────────────────────────────────────────────────────────
  sock.ev.on('messages.update', async (updates) => {
    // Deletions
    const delKeys = updates
      .filter(u => u.update?.messageStubType === 1 || (u.key && !u.update?.message))
      .map(u => u.key).filter(Boolean);
    if (delKeys.length) handleMessageDelete(sock, { keys: delKeys }, db).catch(() => {});

    // Edits
    for (const upd of updates) {
      if (upd.key && upd.update?.message) {
        handleMessageEdit(sock, upd, db).catch(() => {});
      }
    }
  });

  // ── MESSAGES ──────────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const rawMsg of messages) {
      try {
        if (!rawMsg.message) continue;

        // Status handling (auto-view, auto-like)
        if (rawMsg.key.remoteJid === 'status@broadcast') {
          handleStatusMessage(sock, rawMsg, sessionConfig).catch(() => {});
          continue;
        }

        // Newsletter reaction
        if (rawMsg.key.remoteJid?.endsWith('@newsletter')) {
          handleNewsletterReaction(sock, rawMsg).catch(() => {});
          continue;
        }

        // Parse
        const m = sms(sock, rawMsg);
        if (!m) continue;

        // Resolve LID + group info
        if (m.isGroup) {
          try {
            const meta = await sock.groupMetadata(m.chat);
            seedLidFromMeta(meta);
            m.sender       = await resolveLid(sock, m.sender, meta);
            m.groupName    = meta.subject;
            m.groupMembers = meta.participants;
            m.groupAdmins  = [];
            for (const p of meta.participants) {
              if (p.admin) {
                const rj = await resolveLid(sock, p.id, meta);
                m.groupAdmins.push(rj);
              }
            }
            const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
            m.isBotAdmin  = m.groupAdmins.includes(botJid);
            m.isAdmin     = m.groupAdmins.includes(m.sender);
          } catch {}
        }

        // Owner
        const ownerJid = sessionConfig.OWNER_NUMBER?.replace(/[^0-9]/g,'') + '@s.whatsapp.net';
        m.isOwner = m.sender === ownerJid || m.fromMe;

        // mentionedJid
        m.mentionedJid = m.mentionUser || [];

        // Cache for antidelete + anti-edit
        if (m.isGroup) cacheMessage(m);

        // Banned user
        try { const u = await db.getUser(m.sender); if (u?.banned && !m.isOwner) continue; } catch {}

        // Private mode
        if (sessionConfig.MODE === 'private' && !m.isOwner) continue;

        // Group protections
        if (m.isGroup) await handleMessageProtection(sock, m, db).catch(() => {});

        // AI Chatbot (non-command)
        if (m.isGroup && m.body && !m.isCmd) {
          try {
            const g = await db.getGroup(m.chat);
            if (g.chatbot && sessionConfig.GEMINI_API_KEY) {
              const genAI = new GoogleGenerativeAI(sessionConfig.GEMINI_API_KEY);
              const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
              const result = await model.generateContent(String(m.body));
              await m.reply(result.response.text());
              continue;
            }
          } catch {}
        }

        // AFK check
        if (m.mentionedJid?.length) {
          for (const jid of m.mentionedJid) {
            try {
              const u = await db.getUser(jid);
              if (u?.afk) {
                const elapsed = u.afkTime ? Math.floor((Date.now() - new Date(u.afkTime)) / 60000) : 0;
                await m.reply(`😴 @${jid.split('@')[0]} is AFK\n📝 ${u.afkReason || 'No reason'}\n⏱️ ${elapsed}m ago`);
              }
            } catch {}
          }
        }

        // ── PREFIX & COMMAND PARSING ────────────────────────────────────────
        const prefix = sessionConfig.PREFIX;
        const body   = typeof m.body === 'string' ? m.body : '';
        let isCmd = false, command = '', args = [], text = '';

        if (prefix === null || prefix === '' || prefix === 'null') {
          // No-prefix mode
          const parts = body.trim().split(/\s+/);
          command = parts[0]?.toLowerCase() || '';
          args    = parts.slice(1);
          text    = args.join(' ');
          isCmd   = command.length > 0;
        } else {
          isCmd   = m.isCmd;
          command = m.command;
          args    = m.args;
          text    = m.text;
        }

        m.isCmd   = isCmd;
        m.command = command;
        m.args    = args;
        m.text    = text;

        if (!isCmd || !command) continue;

        const cmd = getCommand(command);

        // Unknown command
        if (!cmd) {
          await m.reply(unknownMsg(command, prefix || '')).catch(() => {});
          continue;
        }

        // React ⏳
        try { await m.react('⏳'); } catch {}

        // Lang
        const lang = m.isGroup
          ? ((await db.getGroup(m.chat).catch(() => ({}))).language || sessionConfig.LANGUAGE)
          : sessionConfig.LANGUAGE;

        // Permissions
        if (cmd.ownerOnly && !m.isOwner)             { await m.reply(t(lang,'owner_only')); await m.react('❌').catch(()=>{}); continue; }
        if (cmd.adminOnly && !m.isAdmin && !m.isOwner){ await m.reply(t(lang,'admin_only')); await m.react('❌').catch(()=>{}); continue; }
        if (cmd.groupOnly && !m.isGroup)             { await m.reply(t(lang,'group_only')); await m.react('❌').catch(()=>{}); continue; }
        if (cmd.privateOnly && m.isGroup)            { await m.reply(t(lang,'private_only')); await m.react('❌').catch(()=>{}); continue; }

        try { await sock.sendPresenceUpdate('composing', m.chat); } catch {}

        // Execute
        try {
          await cmd.run(sock, m, { args, text, db, config: sessionConfig, activeSessions, startSession });
          await db.incrementCmds().catch(() => {});
          await m.react('✅').catch(() => {});
        } catch (e) {
          console.error(`[cmd:${command}]`, e.message);
          await m.reply(`❌ Error: ${e.message?.substring(0,100)}`).catch(() => {});
          await m.react('❌').catch(() => {});
        }

        try { await sock.sendPresenceUpdate('paused', m.chat); } catch {}

      } catch (e) {
        if (!e.message?.includes('timed out') && !e.message?.includes('rate-overlimit'))
          console.error('[upsert]', e.message);
      }
    }
  });

  return sock;
}

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT',  () => process.exit(0));
process.on('uncaughtException',  e => { if (!e.message?.includes('timed out')) console.error('uncaught:', e.message); });
process.on('unhandledRejection', e => { if (!e?.message?.includes('timed out')) console.error('unhandled:', e?.message || e); });

startBot().catch(console.error);
module.exports = { activeSessions, startSession };
