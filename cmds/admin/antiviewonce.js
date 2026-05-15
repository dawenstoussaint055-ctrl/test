// cmds/admin/antiviewonce.js
const { t } = require('../../lib/lang');
const config = require('../../config/config');

module.exports = {
  name: 'antiviewonce',
  aliases: ['antiview', 'avo'],
  category: 'admin',
  desc: 'Toggle anti-viewonce - repost view-once media publicly',
  usage: '.antiviewonce <on|off>',
  adminOnly: true,
  groupOnly: true,

  async run(sock, m, { args, db }) {
    const lang = (await db.getGroup(m.from)).language || config.LANGUAGE;
    if (!m.isAdmin) return m.reply(t(lang, 'admin_only'));

    const toggle = args[0]?.toLowerCase();
    if (!toggle || !['on', 'off'].includes(toggle)) {
      return m.reply('📌 Usage: .antiviewonce on / .antiviewonce off');
    }

    const g = await db.getGroup(m.from);
    g.antiviewonce = toggle === 'on';
    await g.save();

    return m.reply(g.antiviewonce
      ? t(lang, 'enabled_msg', { feature: 'Anti-ViewOnce' })
      : t(lang, 'disabled_msg', { feature: 'Anti-ViewOnce' }));
  }
};
