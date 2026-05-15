// cmds/owner/setprefix.js - setprefix with null support (no prefix mode)
const config = require('../../config/config');

module.exports = {
  name: 'setprefix',
  aliases: ['prefix'],
  category: 'owner',
  desc: 'Change prefix. Use "null" or "none" for no-prefix mode.',
  usage: '.setprefix <prefix|null|none>',
  ownerOnly: true,

  async run(sock, m, { args, db }) {
    const input = args[0];
    if (input === undefined) {
      const cur = config.PREFIX === null ? '(none - no prefix)' : `*${config.PREFIX}*`;
      return m.reply(`📌 Current prefix: ${cur}\n\nUsage: .setprefix .\n.setprefix !\n.setprefix null  ← no prefix mode`);
    }

    const isNone = ['null','none','off','no','empty',''].includes(input.toLowerCase());
    const newPrefix = isNone ? null : input;

    config.PREFIX = newPrefix;
    global.BOT_PREFIX = newPrefix;
    await db.setBotData('prefix', newPrefix);

    if (isNone) {
      return m.reply(`✅ Prefix *removed*!\n\n⚠️ Bot is now in *no-prefix mode*.\nEvery message starting with a command name will be processed.\n\nTo restore: type *setprefix .* (without any prefix)`);
    }
    return m.reply(`✅ Prefix changed to *${newPrefix}*!\nTest: ${newPrefix}ping`);
  }
};
