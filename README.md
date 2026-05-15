# 🤖 INCONNU XD V3

<div align="center">

![INCONNU XD V3](https://img.shields.io/badge/INCONNU%20XD-V3-blueviolet?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-25D366?style=for-the-badge&logo=whatsapp)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Advanced WhatsApp Bot with 350+ commands, multi-language support, and deploy system**

[🔑 Get Session](https://inconnu-tech-web-session-id.onrender.com) • [🍴 Fork Repo](https://github.com/INCONNU-BOY/INCONNU-XD-V3/fork) • [📺 Tutorial](https://youtu.be/n09eZbKexQY?si=r_n6K596sdT6l0Qe) • [📢 Channel](https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌐 Multi-Language | EN / FR / ES — full translation on every message |
| 🛡️ Anti-Systems | Anti-Bot, Anti-Link, Anti-Delete, Anti-Tag |
| 🚀 Deploy System | Deploy up to 5 isolated bot instances from WhatsApp |
| 🤖 AI Chatbot | Gemini AI integration (chat + vision) |
| 🎮 Games | Tic-Tac-Toe, Quiz, Hangman, RPS, and more |
| ⬇️ Downloader | YouTube MP3/MP4, TikTok, Spotify search |
| 🖼️ Sticker | Image/video/GIF to sticker, sticker to image |
| 👋 Welcome/Goodbye | Fully customizable with variables |
| 📦 350+ Commands | Across 13+ categories |

---

## 🚀 Deploy

### ⚡ Quick Deploy Options

| Platform | Button |
|---|---|
| **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/INCONNU-BOY/INCONNU-XD-V3) |
| **Heroku** | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/INCONNU-BOY/INCONNU-XD-V3) |
| **Railway** | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/inconnu-xd-v3) |
| **Koyeb** | [![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/INCONNU-BOY/INCONNU-XD-V3&branch=main&name=inconnu-xd-v3) |

### 🖥️ VPS / Panel / Local

```bash
# 1. Clone
git clone https://github.com/INCONNU-BOY/INCONNU-XD-V3
cd INCONNU-XD-V3

# 2. Install
npm install

# 3. Configure
cp .env.example .env
nano .env   # Fill in your values

# 4. Start
npm start
```

---

## ⚙️ Configuration (ENV)

```env
SESSION_ID=INCONNU~XD~FILEID#DECRYPTIONKEY
MONGODB_URI=mongodb+srv://...
OWNER_NUMBER=2250700000000
OWNER_NAME=Your Name
BOT_NAME=INCONNU XD V3
PREFIX=.
LANGUAGE=en
GEMINI_API_KEY=your_key_here
```

### 🔑 Get Session ID

Go to: **https://inconnu-tech-web-session-id.onrender.com**

---

## 📦 Commands

### 👑 Owner
| Command | Description |
|---|---|
| `.deploy <session> [platform]` | Deploy a new isolated bot instance |
| `.deploy list` | List all active deployments |
| `.broadcast <message>` | Broadcast to all groups |
| `.setlang <en\|fr\|es>` | Change bot language |
| `.setbotname <name>` | Change bot name |
| `.setprefix <prefix>` | Change command prefix |
| `.mode <public\|private>` | Change bot mode |
| `.ban @user` | Ban user from bot |
| `.unban @user` | Unban user |
| `.join <link>` | Join a group |
| `.leave` | Leave current group |
| `.restart` | Restart the bot |

### 🛡️ Admin
| Command | Description |
|---|---|
| `.antilink <on\|off> [action]` | Toggle antilink (delete/warn/kick) |
| `.antibot <on\|off>` | Toggle antibot |
| `.antidelete <on\|off>` | Toggle antidelete |
| `.antitag <on\|off>` | Toggle antitag |

### 👥 Group
| Command | Description |
|---|---|
| `.kick @user` | Kick a member |
| `.promote @user` | Promote to admin |
| `.demote @user` | Demote from admin |
| `.mute` / `.unmute` | Lock/unlock group |
| `.warn @user [reason]` | Warn a member (3 = kick) |
| `.tagall [msg]` | Tag all members |
| `.hidetag [msg]` | Hidden tag all members |
| `.setwelcome <msg>` | Set welcome message |
| `.setgoodbye <msg>` | Set goodbye message |
| `.groupinfo` | Show group info |
| `.grouplink` | Get invite link |
| `.delete` | Delete replied message |
| `.chatbot <on\|off>` | Toggle AI chatbot |

### 🔧 Utility
| Command | Description |
|---|---|
| `.ping` | Check bot response time |
| `.menu` | Show all commands |
| `.botinfo` | Bot information |
| `.uptime` | Bot uptime |
| `.translate <lang> <text>` | Translate text |
| `.calc <expression>` | Calculator |
| `.qr <text>` | Generate QR code |
| `.weather <city>` | Weather info |
| `.profile [@user]` | Get profile picture |
| `.id` | Show JID info |
| `.afk [reason]` | Set AFK status |
| `.invite` | Get bot links |

### 🎵 Download
| Command | Description |
|---|---|
| `.ytmp3 <query>` | Download YouTube audio |
| `.ytmp4 <query>` | Download YouTube video |
| `.tiktok <url>` | Download TikTok (no watermark) |
| `.spotify <query>` | Search & download song |

### 🤖 AI
| Command | Description |
|---|---|
| `.ai <question>` | Chat with Gemini AI |
| `.imagine [prompt]` | Analyze image with Gemini Vision |

### 🖼️ Sticker
| Command | Description |
|---|---|
| `.sticker` | Convert image/video to sticker |
| `.stickertext <text>` | Create text sticker |
| `.toimage` | Convert sticker to image |
| `.tovideo` | Convert GIF/sticker to video |

### 🎮 Games
| Command | Description |
|---|---|
| `.ttt @opponent` | Tic-Tac-Toe |
| `.quiz` | Start a quiz |
| `.answer <A-D>` | Answer quiz question |
| `.hangman` | Play hangman |
| `.rps <rock\|paper\|scissors>` | Rock Paper Scissors |

### 🎉 Fun
| Command | Description |
|---|---|
| `.8ball <question>` | Magic 8-ball |
| `.joke` | Random joke |
| `.truth` | Truth question |
| `.dare` | Dare challenge |
| `.ship @user1 @user2` | Love meter |
| `.coinflip` | Flip a coin |
| `.dice [sides]` | Roll a dice |
| `.wyr` | Would You Rather |
| `.nhie` | Never Have I Ever |
| `.roast @user` | Roast someone |
| `.compliment @user` | Compliment someone |
| `.fact` | Random fun fact |

---

## 🚀 Deploy From WhatsApp

```
.deploy INCONNU~XD~FILEID#KEY render
.deploy INCONNU~XD~FILEID#KEY heroku
.deploy INCONNU~XD~FILEID#KEY railway
.deploy INCONNU~XD~FILEID#KEY koyeb
.deploy INCONNU~XD~FILEID#KEY vps
.deploy list
```

> ✅ Each deployed bot has its own session, owner, and runs independently. Max **5 active deployments**.

---

## 🌐 Multi-Language

Change language:
```
.setlang en   # English
.setlang fr   # Français
.setlang es   # Español
```

---

## 👋 Welcome/Goodbye Variables

| Variable | Description |
|---|---|
| `{mention}` | Tag the user |
| `{user}` | User's name |
| `{group}` | Group name |
| `{members}` | Member count |

---

## 📋 Credits

- 👨‍💻 Developer: [INCONNU BOY](https://github.com/INCONNU-BOY)
- 📚 Library: [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
- 🤖 AI: Google Gemini

---

<div align="center">

⭐ **Star this repo if you like it!** ⭐

Made with ❤️ by [INCONNU BOY](https://github.com/INCONNU-BOY)

</div>
