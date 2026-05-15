const {
  proto,
  downloadContentFromMessage,
  getContentType
} = require('@whiskeysockets/baileys');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

function createSerial(len = 16) {
  return crypto.randomBytes(len).toString('hex').substring(0, len);
}

function getNewsletterContext() {
  return {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid:   '120363406278870899@newsletter',
      newsletterName:  '🤖 INCONNU XD V3',
      serverMessageId: -1
    }
  };
}

// ── DOWNLOAD MEDIA ────────────────────────────────────────────────────────────
const downloadMediaMessage = async (m, filename) => {
  let type = m.type;
  if (type === 'viewOnceMessage') type = m.msg?.type || type;

  const typeMap = {
    imageMessage:    ['image',    '.jpg'],
    videoMessage:    ['video',    '.mp4'],
    audioMessage:    ['audio',    '.mp3'],
    stickerMessage:  ['sticker',  '.webp'],
    documentMessage: ['document', null]
  };

  const entry = typeMap[type];
  if (!entry) throw new Error('Unsupported media type: ' + type);

  let ext = entry[1];
  if (type === 'documentMessage') {
    const raw = m.msg?.fileName?.split('.').pop()?.toLowerCase() || 'bin';
    ext = '.' + raw.replace('jpeg','jpg').replace('png','jpg').replace('m4a','mp3');
  }

  const tmpName = filename
    ? filename + ext
    : path.join('/tmp', createSerial(8) + ext);

  const stream = await downloadContentFromMessage(m.msg, entry[0]);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  fs.writeFileSync(tmpName, buffer);
  return fs.readFileSync(tmpName);
};

// ── sms() — core message parser ───────────────────────────────────────────────
const sms = (conn, m) => {
  if (!m) return m;

  // ── key fields
  if (m.key) {
    m.id      = m.key.id;
    m.chat    = m.key.remoteJid;
    m.fromMe  = m.key.fromMe;
    m.isGroup = m.chat?.endsWith('@g.us') || false;
    m.sender  = m.fromMe
      ? conn.user.id.split(':')[0] + '@s.whatsapp.net'
      : m.isGroup
        ? (m.key.participant || m.key.participantPn || m.participant || '')
        : m.key.remoteJid;
    // strip device suffix
    if (m.sender) m.sender = m.sender.replace(/:[0-9]+@/, '@');
  }

  if (m.message) {
    m.type = getContentType(m.message);

    m.msg = (m.type === 'viewOnceMessage')
      ? m.message[m.type].message[getContentType(m.message[m.type].message)]
      : m.message[m.type];

    if (m.msg) {
      if (m.type === 'viewOnceMessage') {
        m.msg.type = getContentType(m.message[m.type].message);
      }

      // ── mentions
      const quotedMention = m.msg.contextInfo?.participant || '';
      const tagMention    = m.msg.contextInfo?.mentionedJid || [];
      const mention       = typeof tagMention === 'string' ? [tagMention] : [...tagMention];
      if (quotedMention) mention.push(quotedMention);
      m.mentionUser = mention.filter(Boolean);

      // ── body
      m.body =
          m.type === 'conversation'               ? m.msg
        : m.type === 'extendedTextMessage'        ? m.msg.text
        : m.type === 'imageMessage'               ? (m.msg.caption || '')
        : m.type === 'videoMessage'               ? (m.msg.caption || '')
        : m.type === 'templateButtonReplyMessage' ? (m.msg.selectedId || '')
        : m.type === 'buttonsResponseMessage'     ? (m.msg.selectedButtonId || '')
        : m.type === 'listResponseMessage'        ? (m.msg.singleSelectReply?.selectedRowId || '')
        : '';

      // ── quoted
      if (m.msg.contextInfo?.quotedMessage) {
        const q = m.msg.contextInfo.quotedMessage;
        m.quoted            = q;
        m.quoted.type       = getContentType(q);
        m.quoted.id         = m.msg.contextInfo.stanzaId;
        m.quoted.sender     = (m.msg.contextInfo.participant || '').replace(/:[0-9]+@/, '@');
        m.quoted.fromMe     = m.quoted.sender.split('@')[0].includes(conn.user?.id?.split(':')[0] || '');
        m.quoted.msg        = (m.quoted.type === 'viewOnceMessage')
          ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)]
          : m.quoted[m.quoted.type];

        if (m.quoted.type === 'viewOnceMessage') {
          m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message);
        }

        m.quoted.body =
            m.quoted.type === 'conversation'        ? m.quoted.msg
          : m.quoted.type === 'extendedTextMessage' ? m.quoted.msg?.text
          : m.quoted.type === 'imageMessage'        ? (m.quoted.msg?.caption || '')
          : m.quoted.type === 'videoMessage'        ? (m.quoted.msg?.caption || '')
          : '';

        const qMention = m.quoted.msg?.contextInfo?.participant || '';
        const qTag     = m.quoted.msg?.contextInfo?.mentionedJid || [];
        const qM       = typeof qTag === 'string' ? [qTag] : [...qTag];
        if (qMention) qM.push(qMention);
        m.quoted.mentionUser = qM.filter(Boolean);

        m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
          key: {
            remoteJid:   m.chat,
            fromMe:      m.quoted.fromMe,
            id:          m.quoted.id,
            participant: m.quoted.sender
          },
          message: m.quoted
        });

        m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename);
        m.quoted.delete   = () => conn.sendMessage(m.chat, { delete: m.quoted.fakeObj.key });
        m.quoted.react    = (emoji) => conn.sendMessage(m.chat, {
          react: { text: emoji, key: m.quoted.fakeObj.key }
        });
      }
    }

    m.download = (filename) => downloadMediaMessage(m, filename);
  }

  // ── command parsing (prefix handled in index.js for null-prefix support)
  const prefix = global.BOT_PREFIX !== undefined ? global.BOT_PREFIX : '.';
  m.prefix = prefix;

  if (prefix === null || prefix === '' || prefix === 'null') {
    // no-prefix mode: handled in index.js
    m.isCmd   = false;
    m.command = '';
    m.args    = [];
    m.text    = '';
  } else {
    const body    = typeof m.body === 'string' ? m.body : '';
    const isCmd   = body.startsWith(prefix);
    m.isCmd   = isCmd;
    m.command = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';
    m.args    = isCmd ? body.slice(prefix.length + m.command.length).trim().split(/\s+/).filter(Boolean) : [];
    m.text    = m.args.join(' ');
  }

  m.pushName = m.pushName || 'User';

  // ── reply helpers
  m.reply = (teks, id = m.chat, option = { mentions: [m.sender] }) =>
    conn.sendMessage(id, {
      text: String(teks),
      contextInfo: { mentionedJid: option.mentions || [], ...getNewsletterContext() }
    }, { quoted: m });

  m.replyS = (stik, id = m.chat, option = { mentions: [m.sender] }) =>
    conn.sendMessage(id, { sticker: stik, contextInfo: { mentionedJid: option.mentions || [] } }, { quoted: m });

  m.replyImg = (img, teks = '', id = m.chat, option = { mentions: [m.sender] }) =>
    conn.sendMessage(id, {
      image: img, caption: teks,
      contextInfo: { mentionedJid: option.mentions || [], ...getNewsletterContext() }
    }, { quoted: m });

  m.replyVid = (vid, teks = '', id = m.chat, option = { mentions: [m.sender], gif: false }) =>
    conn.sendMessage(id, {
      video: vid, caption: teks, gifPlayback: option.gif || false,
      contextInfo: { mentionedJid: option.mentions || [] }
    }, { quoted: m });

  m.replyAud = (aud, id = m.chat, option = { ptt: false }) =>
    conn.sendMessage(id, {
      audio: aud, ptt: option.ptt || false, mimetype: 'audio/mpeg'
    }, { quoted: m });

  m.replyDoc = (doc, id = m.chat, option = { filename: 'file.pdf', mimetype: 'application/pdf' }) =>
    conn.sendMessage(id, {
      document: doc, mimetype: option.mimetype, fileName: option.filename
    }, { quoted: m });

  m.replyContact = (name, info, number) => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${info};\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;
    return conn.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: m });
  };

  m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });

  return m;
};

// ── utils ─────────────────────────────────────────────────────────────────────
function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const mi = Math.floor(s / 60);
  const h = Math.floor(mi / 60);
  const d = Math.floor(h / 24);
  return { d, h: h % 24, m: mi % 60, s: s % 60 };
}

function containsLink(text) {
  return /(https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[A-Za-z0-9]+)/gi.test(text);
}

function isWhatsAppGroupLink(text) {
  return /chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(text);
}

function cleanTmp(filePath) {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
}

module.exports = {
  sms, downloadMediaMessage,
  createSerial, getNewsletterContext,
  formatUptime, containsLink, isWhatsAppGroupLink, cleanTmp
};
