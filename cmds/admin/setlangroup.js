// cmds/admin/setlangroup.js
const { t, isValidLanguage } = require('../../lib/lang');
const config = require('../../config/config');

module.exports = {
  name: 'setlangroup',
  aliases: ['grouplang', 'glang'],
  category: 'admin',
  desc: 'Change language for this group only',
  usage: '.setlangroup <en|fr|es>',
  adminOnly: true,
  groupOnly: true,

  async run(sock, m, { args, db }) {
    const lang = (await db.getGroup(m.from)).language || config.LANGUAGE;
    if (!m.isAdmin) return m.reply(t(lang, 'admin_only'));

    const newLang = args[0]?.toLowerCase();
    if (!newLang || !isValidLanguage(newLang)) {
      return m.reply(t(lang, 'lang_invalid'));
    }

    const g = await db.getGroup(m.from);
    g.language = newLang;
    await g.save();

    return m.reply(t(newLang, 'lang_changed', { lang: newLang.toUpperCase() }));
  }
};
