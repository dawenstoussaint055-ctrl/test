// cmds/admin/antidemote.js
const { t } = require('../../lib/lang');
const config = require('../../config/config');

module.exports = {
  name: 'antidemote',
  aliases: ['adem'],
  category: 'admin',
  desc: 'Toggle anti-demote (auto-re-promote unauthorized demotions)',
  usage: '.antidemote <on|off>',
  adminOnly: true,
  groupOnly: true,

  async run(sock, m, { args, db }) {
    const lang = (await db.getGroup(m.from)).language || config.LANGUAGE;
    if (!m.isAdmin) return m.reply(t(lang, 'admin_only'));

    const toggle = args[0]?.toLowerCase();
    if (!['on','off'].includes(toggle)) return m.reply('📌 Usage: .antidemote on / .antidemote off');

    const g = await db.getGroup(m.from);
    g.antidemote = toggle === 'on';
    await g.save();
    return m.reply(g.antidemote
      ? '🛡️ *Anti-Demote* enabled!\nUnauthorized demotions will be auto-reversed.'
      : '🛡️ *Anti-Demote* disabled!');
  }
};
