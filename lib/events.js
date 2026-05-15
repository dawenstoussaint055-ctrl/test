// lib/events.js - Full protection system with LID fix
const { t } = require('./lang');
const { containsLink } = require('./msg');
const { resolveLid, jidToNumber, seedLidFromMeta } = require('./lid');
const config = require('../config/config');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

const deletedMsgCache  = new Map(); // id -> msg
const editedMsgCache   = new Map(); // id -> original msg
const floodTracker     = new Map(); // jid+sender -> {count,start}
const processedEvents  = new Map(); // dedup map

const DEFAULT_PIC = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';

// ── Utils ─────────────────────────────────────────────────────────────────────
function cacheMessage(m) {
  if (deletedMsgCache.size >= 500) deletedMsgCache.delete(deletedMsgCache.keys().next().value);
  if (m?.key?.id) { deletedMsgCache.set(m.key.id, m); editedMsgCache.set(m.key.id, { ...m, originalBody: m.body }); }
}
function getCachedMessage(id) { return deletedMsgCache.get(id) || null; }
function getOriginalMsg(id)   { return editedMsgCache.get(id) || null; }

function isDuplicate(groupJid, action, participants) {
  const key = `${groupJid}:${action}:${participants.sort().join(',')}`;
  const now = Date.now();
  if (processedEvents.has(key) && now - processedEvents.get(key) < 5000) return true;
  processedEvents.set(key, now);
  for (const [k, v] of processedEvents) if (now - v > 10000) processedEvents.delete(k);
  return false;
}

async function getGroupMeta(sock, jid) {
  try { const m = await sock.groupMetadata(jid); seedLidFromMeta(m); return m; } catch { return null; }
}

async function getProfilePic(sock, jid) {
  try { return await sock.profilePictureUrl(jid, 'image'); } catch { return DEFAULT_PIC; }
}

async function isBotAdmin(sock, groupJid) {
  const meta = await getGroupMeta(sock, groupJid);
  if (!meta) return false;
  const botNum = sock.user?.id?.split(':')[0];
  return meta.participants.some(p => {
    const n = (p.pn || p.id || '').split('@')[0].split(':')[0];
    return n === botNum && (p.admin === 'admin' || p.admin === 'superadmin');
  });
}

async function isOwner(jid, sock, ownerNumber) {
  const num = jid.split('@')[0].split(':')[0];
  return num === ownerNumber || num === sock.user?.id?.split(':')[0];
}

function getTimeZone() { return process.env.TIMEZONE || 'Africa/Abidjan'; }
function getFooter()   { return config.BOT_NAME || 'INCONNU XD V3'; }

// ── PARTICIPANT UPDATE ────────────────────────────────────────────────────────
async function handleParticipantUpdate(sock, update, db) {
  const { id: groupJid, participants, action, author } = update;
  if (!groupJid || !participants?.length) return;

  // Dedup for promote/demote
  if ((action === 'promote' || action === 'demote') && isDuplicate(groupJid, action, participants)) return;

  let g;
  try { g = await db.getGroup(groupJid); } catch { return; }
  const meta = await getGroupMeta(sock, groupJid);
  if (!meta) return;

  const lang        = g.language || config.LANGUAGE;
  const groupName   = meta.subject;
  const memberCount = meta.participants.length;
  const tz          = getTimeZone();
  const currentTime = moment().tz(tz).format('h:mm A');
  const currentDate = moment().tz(tz).format('MMMM Do, YYYY');
  const footer      = getFooter();
  const ownerNum    = config.OWNER_NUMBER?.replace(/[^0-9]/g, '');

  const getCtx = (jids = []) => ({
    mentionedJid: jids.filter(Boolean),
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363403408693274@newsletter',
      newsletterName: config.BOT_NAME,
      serverMessageId: 143
    }
  });

  for (const rawP of participants) {
    const userJid    = await resolveLid(sock, rawP, meta);
    const userNumber = jidToNumber(userJid);
    const ppUrl      = await getProfilePic(sock, userJid);

    // ── ANTIBOT
    if (action === 'add' && g.antibot) {
      if (rawP.endsWith(':0@lid') || rawP.toLowerCase().includes('bot')) {
        try { await sock.groupParticipantsUpdate(groupJid, [rawP], 'remove'); } catch {}
        await sock.sendMessage(groupJid, { text: t(lang, 'antibot_kick', { number: userNumber }), mentions: [userJid] });
        continue;
      }
    }

    // ── WELCOME
    if (action === 'add' && g.welcome) {
      const msg = (g.welcomeMsg || t(lang, 'welcome_default'))
        .replace(/\{mention\}/g, `@${userNumber}`)
        .replace(/\{user\}/g, userNumber)
        .replace(/\{group\}/g, groupName)
        .replace(/\{members\}/g, memberCount);
      const full = `╭━━━━━━━━━━━━━━━╮\n┃  🎉 *WELCOME* 🎉\n╰━━━━━━━━━━━━━━━╯\n\n${msg}\n\n🏠 *Group:* ${groupName}\n👥 *Members:* ${memberCount}\n📅 ${currentDate} | 🕐 ${currentTime}\n\n> _${footer}_`;
      try {
        await sock.sendMessage(groupJid, { image: { url: ppUrl }, caption: full, mentions: [userJid], contextInfo: getCtx([userJid]) });
      } catch { await sock.sendMessage(groupJid, { text: full, mentions: [userJid] }).catch(() => {}); }
    }

    // ── GOODBYE
    if ((action === 'remove' || action === 'leave') && g.goodbye) {
      const isKicked = author && author !== rawP;
      if (isKicked && g.groupevents) {
        const authorJid = await resolveLid(sock, author, meta);
        const authorNum = jidToNumber(authorJid);
        const kickText  = `╭━━━━━━━━━━━━━━━╮\n┃  🚫 *KICKED* 🚫\n╰━━━━━━━━━━━━━━━╯\n\n👤 @${userNumber} *was removed*\n🔨 *By:* @${authorNum}\n🏠 *Group:* ${groupName}\n👥 Remaining: ${memberCount}\n📅 ${currentDate}\n\n> _${footer}_`;
        try {
          await sock.sendMessage(groupJid, { image: { url: ppUrl }, caption: kickText, mentions: [userJid, authorJid], contextInfo: getCtx([userJid, authorJid]) });
        } catch { await sock.sendMessage(groupJid, { text: kickText, mentions: [userJid, authorJid] }).catch(() => {}); }
      } else if (!isKicked) {
        const msg = (g.goodbyeMsg || t(lang, 'goodbye_default'))
          .replace(/\{mention\}/g, `@${userNumber}`)
          .replace(/\{user\}/g, userNumber)
          .replace(/\{group\}/g, groupName)
          .replace(/\{members\}/g, memberCount);
        const full = `╭━━━━━━━━━━━━━━━╮\n┃  👋 *GOODBYE* 👋\n╰━━━━━━━━━━━━━━━╯\n\n${msg}\n\n🏠 *Group:* ${groupName}\n👥 Remaining: ${memberCount}\n📅 ${currentDate}\n\n> _${footer}_`;
        try {
          await sock.sendMessage(groupJid, { image: { url: ppUrl }, caption: full, mentions: [userJid], contextInfo: getCtx([userJid]) });
        } catch { await sock.sendMessage(groupJid, { text: full, mentions: [userJid] }).catch(() => {}); }
      }
    }

    // ── ANTIPROMOTE
    if (action === 'promote' && g.antipromote && author) {
      const authorJid  = await resolveLid(sock, author, meta);
      const authorNum  = jidToNumber(authorJid);
      const botIsAdmin = await isBotAdmin(sock, groupJid);
      const authorIsOwner = await isOwner(authorJid, sock, ownerNum);
      if (!authorIsOwner && botIsAdmin) {
        await sock.sendMessage(groupJid, {
          text: `🛡️ *ANTI-PROMOTE*\n@${authorNum} promoted @${userNumber} to admin.\n⚠️ Demoting @${userNumber}...`,
          mentions: [authorJid, userJid]
        });
        await new Promise(r => setTimeout(r, 500));
        try { await sock.groupParticipantsUpdate(groupJid, [userJid], 'demote'); } catch {}
        continue;
      }
    }

    // ── ANTIDEMOTE
    if (action === 'demote' && g.antidemote && author) {
      const authorJid  = await resolveLid(sock, author, meta);
      const authorNum  = jidToNumber(authorJid);
      const botIsAdmin = await isBotAdmin(sock, groupJid);
      const authorIsOwner = await isOwner(authorJid, sock, ownerNum);
      if (!authorIsOwner && botIsAdmin) {
        await sock.sendMessage(groupJid, {
          text: `🛡️ *ANTI-DEMOTE*\n@${authorNum} demoted @${userNumber}.\n⚠️ Re-promoting @${userNumber}...`,
          mentions: [authorJid, userJid]
        });
        await new Promise(r => setTimeout(r, 500));
        try { await sock.groupParticipantsUpdate(groupJid, [userJid], 'promote'); } catch {}
        continue;
      }
    }

    // ── PROMOTE/DEMOTE EVENTS
    if ((action === 'promote' || action === 'demote') && g.groupevents) {
      const authorJid  = author ? await resolveLid(sock, author, meta) : null;
      const authorNum  = authorJid ? jidToNumber(authorJid) : 'System';
      const mentions   = [userJid, ...(authorJid ? [authorJid] : [])];
      const verb       = action === 'promote' ? '👑 *PROMOTED*' : '📉 *DEMOTED*';
      const txt        = `╭━━━━━━━━━━━━━━━╮\n┃  ${verb}\n╰━━━━━━━━━━━━━━━╯\n\n👤 @${userNumber}\n${authorJid ? `🔧 By: @${authorNum}` : ''}\n🏠 ${groupName}\n📅 ${currentDate} | 🕐 ${currentTime}\n\n> _${footer}_`;
      await sock.sendMessage(groupJid, { text: txt, mentions, contextInfo: getCtx(mentions) }).catch(() => {});
    }
  }
}

// ── MESSAGE PROTECTION ────────────────────────────────────────────────────────
async function handleMessageProtection(sock, m, db) {
  if (!m.isGroup) return;
  let g;
  try { g = await db.getGroup(m.chat); } catch { return; }

  const lang   = g.language || config.LANGUAGE;
  const sender = m.sender;
  const number = jidToNumber(sender);
  const body   = typeof m.body === 'string' ? m.body : '';
  if (m.isAdmin || m.isOwner) return;

  // ── ANTIFLOOD
  if (g.antiflood) {
    const fKey = m.chat + sender;
    if (!floodTracker.has(fKey)) {
      floodTracker.set(fKey, { count: 1, start: Date.now() });
      setTimeout(() => floodTracker.delete(fKey), 5000);
    } else {
      const f = floodTracker.get(fKey);
      f.count++;
      if (f.count > (g.antifloodMax || 5)) {
        try { await sock.sendMessage(m.chat, { delete: m.key }); } catch {}
        await sock.sendMessage(m.chat, { text: `⚠️ @${number} slow down!`, mentions: [sender] });
        return;
      }
    }
  }

  // ── ANTIBADWORD
  if (g.antibadword && g.badWords?.length && body) {
    const lower = body.toLowerCase();
    const found = g.badWords.find(w => new RegExp(`\\b${w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'i').test(lower));
    if (found) {
      try { await sock.sendMessage(m.chat, { delete: m.key }); } catch {}
      const warns = await db.warnUser(sender, m.chat);
      await sock.sendMessage(m.chat, {
        text: `🚫 @${number} bad word detected! Deleted.\n⚠️ Warn: *${warns}/3*`,
        mentions: [sender]
      });
      if (warns >= 3) {
        if (await isBotAdmin(sock, m.chat)) try { await sock.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
        await db.resetWarn(sender, m.chat);
      }
      return;
    }
  }

  // ── ANTILINK
  if (g.antilink && body && containsLink(body)) {
    const action = g.antilinkAction || 'delete';
    try { await sock.sendMessage(m.chat, { delete: m.key }); } catch {}
    if (action === 'warn') {
      const warns = await db.warnUser(sender, m.chat);
      await sock.sendMessage(m.chat, { text: t(lang, 'antilink_warn', { number, action: 'Warn' }) + `\n⚠️ *${warns}/3*`, mentions: [sender] });
      if (warns >= 3) {
        if (await isBotAdmin(sock, m.chat)) try { await sock.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
        await db.resetWarn(sender, m.chat);
      }
    } else if (action === 'kick') {
      if (await isBotAdmin(sock, m.chat)) try { await sock.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
      await sock.sendMessage(m.chat, { text: t(lang, 'antilink_warn', { number, action: 'Kick' }), mentions: [sender] });
    } else {
      await sock.sendMessage(m.chat, { text: t(lang, 'antilink_warn', { number, action: 'Delete' }), mentions: [sender] });
    }
    return;
  }

  // ── ANTITAG
  if (g.antitag && m.mentionUser?.length > 5) {
    try { await sock.sendMessage(m.chat, { delete: m.key }); } catch {}
    await sock.sendMessage(m.chat, { text: t(lang, 'antitag_warn', { number }), mentions: [sender] });
    return;
  }

  // ── ANTI-VIEWONCE
  if (g.antiviewonce && m.type === 'viewOnceMessage') {
    try {
      const buffer = await m.download();
      const real   = m.msg?.type || 'imageMessage';
      const caption = `👁️ *Anti-ViewOnce* | @${number}`;
      if (real === 'imageMessage')
        await sock.sendMessage(m.chat, { image: buffer, caption, mentions: [sender] });
      else if (real === 'videoMessage')
        await sock.sendMessage(m.chat, { video: buffer, caption, mentions: [sender] });
    } catch {}
  }

  // ── ANTI-GROUP-MENTION (groupStatusMentionMessage)
  if (m.type === 'groupStatusMentionMessage' && g.antigroupmention) {
    const action = (g.antigroupmention || 'warn').toLowerCase();
    if (action === 'delete' || action === 'warn' || action === 'kick') {
      try { await sock.sendMessage(m.chat, { delete: m.key }); } catch {}
    }
    if (action === 'kick') {
      if (await isBotAdmin(sock, m.chat)) try { await sock.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
    } else {
      await sock.sendMessage(m.chat, { text: `⚠️ @${number} mentioning this group in status is not allowed!`, mentions: [sender] });
    }
  }
}

// ── ANTIDELETE ────────────────────────────────────────────────────────────────
async function handleMessageDelete(sock, update, db) {
  for (const key of (update.keys || [])) {
    if (!key.remoteJid?.endsWith('@g.us')) continue;
    let g;
    try { g = await db.getGroup(key.remoteJid); } catch { continue; }
    if (!g.antidelete) continue;

    const lang    = g.language || config.LANGUAGE;
    const cached  = getCachedMessage(key.id);
    if (!cached) continue;

    const meta    = await getGroupMeta(sock, key.remoteJid);
    const rawSender = key.participant || cached.sender || '';
    const sender  = await resolveLid(sock, rawSender, meta);
    const number  = jidToNumber(sender);
    const body    = typeof cached.body === 'string' ? cached.body : '';
    const type    = cached.type || 'conversation';
    const group   = meta?.subject || key.remoteJid.split('@')[0];
    const tz      = getTimeZone();
    const time    = moment().tz(tz).format('h:mm A');
    const date    = moment().tz(tz).format('DD/MM/YYYY');
    const footer  = getFooter();

    const baseAlert = `*𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝚂𝚈𝚂𝚃𝙴𝙼*\n\n👤 *From:* @${number}\n🕑 *Time:* ${time}\n📆 *Date:* ${date}\n💬 *Group:* ${group}\n\n> _${footer}_`;
    const mentions = sender && !sender.endsWith('@lid') ? [sender] : [];

    try {
      if (['imageMessage','videoMessage','audioMessage','stickerMessage'].includes(type)) {
        const buffer = await cached.download();
        if (type === 'imageMessage')
          await sock.sendMessage(key.remoteJid, { image: buffer, caption: baseAlert, mentions });
        else if (type === 'videoMessage')
          await sock.sendMessage(key.remoteJid, { video: buffer, caption: baseAlert, mentions });
        else if (type === 'audioMessage') {
          await sock.sendMessage(key.remoteJid, { text: baseAlert, mentions });
          await sock.sendMessage(key.remoteJid, { audio: buffer, mimetype: 'audio/mpeg', ptt: false });
        } else if (type === 'stickerMessage') {
          await sock.sendMessage(key.remoteJid, { sticker: buffer });
          await sock.sendMessage(key.remoteJid, { text: baseAlert, mentions });
        }
      } else {
        const content = body ? `${baseAlert}\n\n📝 *Content:*\n${body}` : baseAlert;
        await sock.sendMessage(key.remoteJid, { text: content, mentions });
      }
    } catch {}
  }
}

// ── ANTI-EDIT ─────────────────────────────────────────────────────────────────
async function handleMessageEdit(sock, update, db) {
  const { key, update: up } = update;
  if (!key || !up?.message) return;
  if (key.fromMe || key.remoteJid === 'status@broadcast') return;

  const isGroup = key.remoteJid?.endsWith('@g.us');
  let g = null;
  if (isGroup) {
    try { g = await db.getGroup(key.remoteJid); } catch {}
    if (!g?.antiedit) return;
  }

  const original = getOriginalMsg(key.id);
  const origBody = original?.originalBody || original?.body || 'N/A';

  // Extract new content
  const newMsg   = up.message;
  const newType  = Object.keys(newMsg)[0];
  const newBody  = newMsg[newType]?.text || newMsg[newType]?.caption || newMsg.conversation || `[${newType}]`;

  if (!newBody || newBody === origBody) return;

  const meta   = isGroup ? await getGroupMeta(sock, key.remoteJid) : null;
  const rawSndr = key.participant || key.remoteJid;
  const sender = await resolveLid(sock, rawSndr, meta);
  const number = jidToNumber(sender);
  const tz     = getTimeZone();
  const time   = moment().tz(tz).format('h:mm A');
  const date   = moment().tz(tz).format('DD/MM/YYYY');
  const group  = meta?.subject || 'DM';
  const footer = getFooter();

  const alertText = `*✏️ ANTI-EDIT MESSAGE SYSTEM*\n\n👤 *Edited By:* @${number}\n🕑 *Time:* ${time}\n📆 *Date:* ${date}\n💬 *Chat:* ${group}\n\n📄 *Original:* ${origBody}\n📝 *Edited To:* ${newBody}\n\n> _${footer}_`;
  const mentions  = sender && !sender.endsWith('@lid') ? [sender] : [];

  const mode = (isGroup && g?.antiedit) || config.ANTI_EDIT || 'inchat';
  const ownerJid = config.OWNER_NUMBER?.replace(/[^0-9]/g,'') + '@s.whatsapp.net';

  try {
    if (mode === 'inchat' || mode === 'both') {
      await sock.sendMessage(key.remoteJid, { text: alertText, mentions });
    }
    if (mode === 'indm' || mode === 'both') {
      await sock.sendMessage(ownerJid, { text: alertText, mentions });
    }
  } catch {}
}

// ── STATUS HANDLERS ───────────────────────────────────────────────────────────
async function handleStatusMessage(sock, message, sessionConfig) {
  if (!message?.key || message.key.remoteJid !== 'status@broadcast') return;
  if (!message.key.participant) return;

  try {
    // Auto-view status
    if (sessionConfig.AUTO_VIEW_STATUS === 'true' || sessionConfig.AUTO_VIEW_STATUS === true) {
      await sock.readMessages([message.key]);
    }

    // Auto-like status
    if (sessionConfig.AUTO_LIKE_STATUS === 'true' || sessionConfig.AUTO_LIKE_STATUS === true) {
      const emojis = sessionConfig.AUTO_LIKE_EMOJI
        ? (Array.isArray(sessionConfig.AUTO_LIKE_EMOJI) ? sessionConfig.AUTO_LIKE_EMOJI : sessionConfig.AUTO_LIKE_EMOJI.split(','))
        : ['❤️','🔥','💯','👍','😍','🥰','💖','✨','🎉','😎'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)].trim();
      await sock.sendMessage(
        message.key.remoteJid,
        { react: { text: emoji, key: message.key } },
        { statusJidList: [message.key.participant] }
      );
    }
  } catch {}
}

// ── NEWSLETTER REACTION ───────────────────────────────────────────────────────
const NEWSLETTER_JID = '120363403408693274@newsletter';
const nlEmojis = ['💜','🔥','💫','👍','❤️','🩷','✨','🌟','🎉','😎','👑','💎','🚀','🫶','🤝'];

async function handleNewsletterReaction(sock, message) {
  try {
    const jid = message.key.remoteJid;
    if (jid !== NEWSLETTER_JID) return;
    const messageId = message.newsletterServerId;
    if (!messageId) return;
    const emoji = nlEmojis[Math.floor(Math.random() * nlEmojis.length)];
    for (let i = 0; i < 3; i++) {
      try {
        await sock.newsletterReactMessage(jid, messageId.toString(), emoji);
        break;
      } catch { await new Promise(r => setTimeout(r, 1500)); }
    }
  } catch {}
}

// ── AUTO-BIO ──────────────────────────────────────────────────────────────────
const bioQuotes = {
  morning:   ['☀️ Rise and shine!', '🌅 New day, new goals.', '⚡ Start strong!'],
  afternoon: ['⏳ Keep going!', '🔥 Stay focused!', '🏗️ Build greatness!'],
  evening:   ['🛌 Recharge wisely.', '✨ You did well today.', '🌙 Dream big.'],
  night:     ['🌌 Night mode on.', '⭐ Stars shine in the dark.', '🧘 Peace within.'],
  latenight: ['🕶️ Legends never sleep.', '🔕 Silence = answers.', '🌌 Never waste the night.']
};
function getTimeBlock() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 16) return 'afternoon';
  if (h >= 16 && h < 21) return 'evening';
  if (h >= 21 || h < 2) return 'night';
  return 'latenight';
}
async function updateAutoBio(sock) {
  try {
    const block  = getTimeBlock();
    const quotes = bioQuotes[block];
    const quote  = quotes[Math.floor(Math.random() * quotes.length)];
    const date   = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date());
    await sock.updateProfileStatus(`${config.BOT_NAME} Online ||\n\n📅 ${date}\n\n➤ ${quote}`);
  } catch {}
}

// ── ANTICALL ──────────────────────────────────────────────────────────────────
async function handleAntiCall(sock, calls, sessionConfig) {
  const antiCall = sessionConfig.ANTI_CALL || 'false';
  if (antiCall === 'false') return;
  for (const call of calls) {
    if (call.status !== 'offer') continue;
    const msg = sessionConfig.ANTI_CALL_MSG || 'Calls are not allowed. This bot auto-rejects calls.';
    try { await sock.sendMessage(call.from, { text: msg }); } catch {}
    try { await sock.rejectCall(call.id, call.from); } catch {}
    if (antiCall === 'block') {
      try { await sock.updateBlockStatus(call.from, 'block'); } catch {}
    }
  }
}

module.exports = {
  handleParticipantUpdate,
  handleMessageProtection,
  handleMessageDelete,
  handleMessageEdit,
  handleStatusMessage,
  handleNewsletterReaction,
  handleAntiCall,
  updateAutoBio,
  cacheMessage,
  getCachedMessage,
  getOriginalMsg
};
