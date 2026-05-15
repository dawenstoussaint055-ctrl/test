// cmds/sticker/sticker.js
const { t } = require('../../lib/lang');
const config = require('../../config/config');
const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { createSerial } = require('../../lib/msg');

async function imageToWebp(buffer) {
  return await sharp(buffer).webp({ quality: 80 }).toBuffer();
}

async function videoToWebp(inputPath, outputPath) {
  await execAsync(`ffmpeg -i "${inputPath}" -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease" -loop 0 -preset default -an -vsync 0 "${outputPath}" -y`);
  return fs.readFileSync(outputPath);
}

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker', 'stik'],
  category: 'sticker',
  desc: 'Convert image/video/GIF to sticker',
  usage: '.sticker [reply to media]',

  async run(sock, m, { args, db }) {
    const lang = m.isGroup
      ? (await db.getGroup(m.from)).language || config.LANGUAGE
      : config.LANGUAGE;

    const packName = args.join(' ') || config.BOT_NAME;
    const authorName = config.OWNER_NAME;

    const target = m.quoted || m;
    const type = target?.type;

    if (!['imageMessage', 'videoMessage', 'stickerMessage'].includes(type)) {
      return m.reply(t(lang, 'reply_required') + '\n📌 Reply to an image, video, or GIF.');
    }

    await m.reply(t(lang, 'sticker_creating'));

    try {
      const buffer = await target.download();

      if (type === 'imageMessage') {
        const webp = await imageToWebp(buffer);
        await sock.sendMessage(m.from, {
          sticker: webp,
          stickerMetadata: { pack: packName, author: authorName }
        }, { quoted: m });

      } else if (type === 'videoMessage') {
        const tmpIn = `/tmp/${createSerial(8)}.mp4`;
        const tmpOut = `/tmp/${createSerial(8)}.webp`;
        fs.writeFileSync(tmpIn, buffer);
        const webp = await videoToWebp(tmpIn, tmpOut);
        await sock.sendMessage(m.from, {
          sticker: webp,
          stickerMetadata: { pack: packName, author: authorName }
        }, { quoted: m });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}

      } else if (type === 'stickerMessage') {
        // Convert sticker back to image
        const img = await sharp(buffer).png().toBuffer();
        await sock.sendMessage(m.from, { image: img, caption: '🖼️ Sticker → Image' }, { quoted: m });
      }

    } catch (e) {
      console.error('Sticker error:', e);
      return m.reply(t(lang, 'sticker_error'));
    }
  }
};
        
