// cmds/utility/ping.js
const { t } = require('../../lib/lang');
const { formatUptime } = require('../../lib/msg');
const { getTotalCount } = require('../../lib/loader');
const config = require('../../config/config');

module.exports = {
  name: 'ping',
  aliases: ['speed', 'test'],
  category: 'utility',
  desc: 'Check bot response time',
  usage: '.ping',

  async run(sock, m, { db }) {
    const lang = m.isGroup
      ? (await db.getGroup(m.from)).language || config.LANGUAGE
      : config.LANGUAGE;

    const start = Date.now();
    await m.reply('🏓');
    const time = Date.now() - start;
    const date = new Date().toLocaleString();

    return m.reply(t(lang, 'ping_response', {
      time,
      botname: config.BOT_NAME,
      date,
      lang: lang.toUpperCase()
    }));
  }
};
