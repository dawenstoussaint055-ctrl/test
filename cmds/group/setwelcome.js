// cmds/group/setwelcome.js
const { t } = require('../../lib/lang');
const config = require('../../config/config');

module.exports = {
  name: 'setwelcome',
  aliases: ['welcome', 'welcomemsg'],
  category: 'group',
  desc: 'Set welcome message. Variables: {mention} {user} {group} {members}',
  usage: '.setwelcome <message>',
  adminOnly: true,
  groupOnly: true,

  async run(sock, m, { args, db }) {
    const lang = (await db.getGroup(m.from)).language || config.LANGUAGE;
    if (!m.isAdmin) return m.reply(t(lang, 'admin_only'));

    const text = args.join(' ');
    if (!text) {
      return m.reply(`📝 Usage: .setwelcome <message>\n\nVariables:\n{mention} - tag user\n{user} - user name\n{group} - group name\n{members} - member count\n\nExample:\n.setwelcome Welcome {mention} to {group}! We have {members} members.`);
    }

    const g = await db.getGroup(m.from);
    g.welcome = true;
    g.welcomeMsg = text;
    await g.save();
    return m.reply(`✅ Welcome message set!\n\n*Preview:*\n${text.replace('{user}', m.pushName).replace('{group}', m.groupName || 'Group').replace('{members}', m.groupMembers?.length || '?').replace('{mention}', '@' + m.sender.split('@')[0])}`);
  }
};
