require('dotenv').config();

module.exports = {
  SESSION_ID:       process.env.SESSION_ID || 'INCONNU~XD~brgxDboB#k_26XIW2PYPDgjup96mGnOn11syzwwXp0SOLgzA6tNc',
  MONGODB_URI:      process.env.MONGODB_URI || '',
  BOT_NAME:         process.env.BOT_NAME || 'INCONNU XD V3',
  PREFIX:           process.env.PREFIX !== undefined ? (process.env.PREFIX === 'null' ? null : process.env.PREFIX) : '.',
  OWNER_NUMBER:     process.env.OWNER_NUMBER || '',
  OWNER_NAME:       process.env.OWNER_NAME || 'INCONNU BOY',
  LANGUAGE:         process.env.LANGUAGE || 'en',
  GEMINI_API_KEY:   process.env.GEMINI_API_KEY || '',
  MODE:             process.env.MODE || 'public',
  MAX_DEPLOY_SESSIONS: 5,

  // Status
  AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'false',
  AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'false',
  AUTO_LIKE_EMOJI:  process.env.AUTO_LIKE_EMOJI  || '❤️,🔥,💯,👍,😍',

  // Features
  AUTO_BIO:         process.env.AUTO_BIO   || 'false',
  AUTO_TYPING:      process.env.AUTO_TYPING || 'true',
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || 'false',
  ANTI_CALL:        process.env.ANTI_CALL  || 'false',
  ANTI_CALL_MSG:    process.env.ANTI_CALL_MSG || 'Calls are not allowed. This bot auto-rejects calls.',
  ANTI_EDIT:        process.env.ANTI_EDIT  || 'inchat',
  TIMEZONE:         process.env.TIMEZONE   || 'Africa/Abidjan',

  // Group defaults
  ANTI_DELETE:      process.env.ANTI_DELETE === 'true',
  ANTI_LINK:        process.env.ANTI_LINK  === 'true',
  ANTI_BOT:         process.env.ANTI_BOT   === 'true',
  ANTI_TAG:         process.env.ANTI_TAG   === 'true',

  // Links
  SESSION_GET_URL:  'https://inconnu-tech-web-session-id.onrender.com',
  FORK_URL:         'https://github.com/INCONNU-BOY/INCONNU-XD-V3/fork',
  GITHUB_URL:       'https://github.com/INCONNU-BOY',
  WA_CHANNEL:       'https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J',
  YT_TUTORIAL:      'https://youtu.be/n09eZbKexQY?si=r_n6K596sdT6l0Qe',

  // Deploy platforms
  DEPLOY_PLATFORMS: {
    render:  process.env.RENDER_DEPLOY_HOOK || '',
    heroku:  { apiKey: process.env.HEROKU_API_KEY || '', appName: process.env.HEROKU_APP_NAME || '' },
    railway: process.env.RAILWAY_TOKEN || '',
    koyeb:   process.env.KOYEB_TOKEN   || ''
  }
};
