// cmds/admin/antilink.js
const { t } = require('../../lib/lang');
const config = require('../../config/config');

module.exports = {
  name: 'antilink',
  aliases: ['al'],
  category: 'admin',
  desc: 'Toggle antilink. Actions: delete / warn / kick',
  usage: '.antilink <on|off> [delete|warn|kick]',
  adminOnly: true,
  groupOnly: true,

  async run(sock, m, { args, db }) {
    const lang = (await db.getGroup(m.from)).language || config.LANGUAGE;
    if (!m.isAdmin) return m.reply(t(lang, 'admin_only'));

    const toggle = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase() || 'delete';

    if (!toggle || !['on', 'off'].includes(toggle)) {
      return m.reply('📌 Usage: .antilink on [delete|warn|kick]\n         .antilink off');
    }

    const g = await db.getGroup(m.from);
    g.antilink = toggle === 'on';
    if (toggle === 'on' && ['delete', 'warn', 'kick'].includes(action)) {
      g.antilinkAction = action;
    }
    await g.save();

    const status = g.antilink
      ? t(lang, 'enabled_msg', { feature: 'Anti-Link' }) + ` (Action: *${g.antilinkAction}*)`
      : t(lang, 'disabled_msg', { feature: 'Anti-Link' });
    return m.reply(status);
  }
};
