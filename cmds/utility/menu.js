// cmds/utility/menu.js
const { t } = require('../../lib/lang');
const { getAllCategories, getTotalCount } = require('../../lib/loader');
const { formatUptime } = require('../../lib/msg');
const config = require('../../config/config');

module.exports = {
  name: 'menu',
  aliases: ['help', 'cmds', 'commands', 'list'],
  category: 'utility',
  desc: 'Show all bot commands',
  usage: '.menu [category]',

  async run(sock, m, { db }) {
    const lang = m.isGroup
      ? (await db.getGroup(m.from)).language || config.LANGUAGE
      : config.LANGUAGE;

    const up = formatUptime(process.uptime() * 1000);
    const uptime = t(lang, 'uptime_format', up);
    const categories = getAllCategories();
    const total = getTotalCount();
    const date = new Date().toLocaleString();

    const header = t(lang, 'menu_header', {
      botname: config.BOT_NAME,
      user: m.pushName,
      date,
      prefix: config.PREFIX,
      count: total,
      lang: lang.toUpperCase(),
      uptime
    });

    const catLabel = {
      owner:    t(lang, 'menu_cat_owner'),
      admin:    t(lang, 'menu_cat_admin'),
      group:    t(lang, 'menu_cat_group'),
      fun:      t(lang, 'menu_cat_fun'),
      media:    t(lang, 'menu_cat_media'),
      utility:  t(lang, 'menu_cat_utility'),
      ai:       t(lang, 'menu_cat_ai'),
      nsfw:     t(lang, 'menu_cat_nsfw'),
      download: t(lang, 'menu_cat_download'),
      social:   t(lang, 'menu_cat_social'),
      game:     t(lang, 'menu_cat_game'),
      sticker:  t(lang, 'menu_cat_sticker'),
      convert:  t(lang, 'menu_cat_convert'),
      info:     t(lang, 'menu_cat_info'),
    };

    let body = header + '\n\n';

    for (const [cat, cmds] of categories) {
      if (!m.isOwner && cat === 'owner') continue;
      const label = catLabel[cat] || cat.toUpperCase();
      body += `╔══ ${label} ══\n`;
      for (const cmd of cmds) {
        body += `║ ${config.PREFIX}${cmd}\n`;
      }
      body += `╚${'═'.repeat(20)}\n\n`;
    }

    body += t(lang, 'menu_footer');

    return m.reply(body);
  }
};
