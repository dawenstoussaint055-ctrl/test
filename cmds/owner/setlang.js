// cmds/owner/settings.js - Owner settings commands
const { t, isValidLanguage } = require('../../lib/lang');
const config = require('../../config/config');

module.exports = {
  name: 'setlang',
  aliases: ['changelang', 'lang'],
  category: 'owner',
  desc: 'Change bot language (en / fr / es)',
  usage: '.setlang <en|fr|es>',
  ownerOnly: true,

  async run(sock, m, { args, db }) {
    const lang = args[0]?.toLowerCase();
    if (!lang || !isValidLanguage(lang)) {
      return m.reply(t(config.LANGUAGE, 'lang_invalid'));
    }
    config.LANGUAGE = lang;
    await db.setBotData('language', lang);
    return m.reply(t(lang, 'lang_changed', { lang: lang.toUpperCase() }));
  }
};
