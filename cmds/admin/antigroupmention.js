// cmds/admin/antigroupmention.js
const { t } = require('../../lib/lang');
const config = require('../../config/config');

module.exports = {
  name: 'antigroupmention',
  aliases: ['agm'],
  category: 'admin',
  desc: 'Toggle anti-group-mention (prevent tagging group in status)',
  usage: '.antigroupmention <on|off|delete|kick|warn>',
  adminOnly: true,
  groupOnly: true,

  async run(sock, m, { args, db }) {
    const lang = (await db.getGroup(m.from)).language || config.LANGUAGE;
    if (!m.isAdmin) return m.reply(t(lang, 'admin_only'));
    const toggle = args[0]?.toLowerCase();
    const valid = ['on','off','delete','kick','warn'];
    if (!valid.includes(toggle)) return m.reply('📌 Usage: .antigroupmention on|off|delete|kick|warn');
    const g = await db.getGroup(m.from);
    g.antigroupmention = toggle === 'off' ? false : toggle === 'on' ? 'warn' : toggle;
    await g.save();
    return m.reply(g.antigroupmention
      ? `🏷️ *Anti-Group-Mention* enabled! Action: *${g.antigroupmention}*`
      : '🏷️ *Anti-Group-Mention* disabled!');
  }
};
