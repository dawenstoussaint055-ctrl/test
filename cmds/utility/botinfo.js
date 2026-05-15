// cmds/utility/botinfo.js
const { t } = require('../../lib/lang');
const { formatUptime } = require('../../lib/msg');
const { getTotalCount } = require('../../lib/loader');
const config = require('../../config/config');

module.exports = {
  name: 'botinfo',
  aliases: ['info', 'about'],
  category: 'utility',
  desc: 'Show bot information',
  usage: '.botinfo',

  async run(sock, m, { db }) {
    const lang = m.isGroup
      ? (await db.getGroup(m.from)).language || config.LANGUAGE
      : config.LANGUAGE;
    const up = formatUptime(process.uptime() * 1000);
    const uptime = t(lang, 'uptime_format', up);

    return m.reply(t(lang, 'bot_info', {
      botname: config.BOT_NAME,
      owner: config.OWNER_NAME,
      count: getTotalCount(),
      lang: lang.toUpperCase(),
      prefix: config.PREFIX,
      uptime
    }));
  }
};
