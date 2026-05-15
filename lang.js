const languages = {
  en: {
    // --- GENERAL ---
    loading: '⏳ Loading...',
    error: '❌ An error occurred: {error}',
    success: '✅ Done!',
    no_permission: '🚫 You do not have permission to use this command.',
    owner_only: '👑 This command is for the bot owner only.',
    admin_only: '🛡️ This command is for group admins only.',
    bot_admin_required: '🤖 The bot must be an admin to use this command.',
    group_only: '👥 This command can only be used in groups.',
    private_only: '💬 This command can only be used in private chat.',
    invalid_usage: '❌ Invalid usage!\n📌 Usage: {usage}',
    reply_required: '↩️ Please reply to a message to use this command.',
    wait: '⏳ Please wait...',
    done: '✅ Done!',
    not_found: '❌ Not found: {item}',
    disabled: '🚫 This feature is disabled.',
    enabled_msg: '✅ {feature} has been enabled.',
    disabled_msg: '🚫 {feature} has been disabled.',

    // --- PING ---
    ping_response: '🏓 *Pong!*\n⚡ Response time: *{time}ms*\n🤖 Bot: *{botname}*\n📅 Date: *{date}*\n🌐 Language: *{lang}*',

    // --- MENU ---
    menu_header: `╔═══════════════════════╗
║   *{botname}*   ║
╚═══════════════════════╝
👤 User: {user}
📅 Date: {date}
⚡ Prefix: *{prefix}*
📦 Commands: *{count}*
🌐 Language: *{lang}*
🕐 Uptime: *{uptime}*`,
    menu_footer: `> ⭐ *INCONNU XD V3* | by INCONNU BOY`,
    menu_cat_owner: '👑 OWNER',
    menu_cat_admin: '🛡️ ADMIN',
    menu_cat_group: '👥 GROUP',
    menu_cat_fun: '🎉 FUN',
    menu_cat_media: '🎵 MEDIA',
    menu_cat_utility: '🔧 UTILITY',
    menu_cat_ai: '🤖 AI',
    menu_cat_nsfw: '🔞 NSFW',
    menu_cat_info: 'ℹ️ INFO',
    menu_cat_download: '⬇️ DOWNLOAD',
    menu_cat_social: '🌐 SOCIAL',
    menu_cat_game: '🎮 GAME',
    menu_cat_sticker: '🖼️ STICKER',
    menu_cat_convert: '🔄 CONVERT',

    // --- ANTI-BOT ---
    antibot_kick: '🤖 *Anti-Bot Activated!*\n👋 Bot *{number}* has been removed from the group.',
    antibot_warn: '⚠️ Bots are not allowed in this group!',

    // --- ANTI-LINK ---
    antilink_warn: '🔗 *Anti-Link Warning!*\n⚠️ Links are not allowed in this group!\n👤 User: @{number}\n⚡ Action: *{action}*',
    antilink_delete: '🗑️ Message deleted.',
    antilink_kick: '👋 User kicked for sending a link.',

    // --- ANTI-DELETE ---
    antidelete_header: '🗑️ *Message Deleted!*\n👤 From: @{number}\n👥 Group: {group}\n📝 Content:',

    // --- ANTI-TAG ---
    antitag_warn: '🏷️ *Anti-Tag Warning!*\n⚠️ Tagging everyone is not allowed!\n👤 User: @{number}',

    // --- WELCOME/GOODBYE ---
    welcome_default: '👋 Welcome to *{group}*, @{number}!\n👥 Members: *{members}*\nEnjoy your stay! 🎉',
    goodbye_default: '😢 *@{number}* has left *{group}*.\nGoodbye! 👋\n👥 Members: *{members}*',

    // --- DEPLOY ---
    deploy_start: '🚀 *Deploying your bot...*\n⏳ This may take a few minutes.',
    deploy_success: '✅ *Bot deployed successfully!*\n🔗 Your bot is now live!\n👑 Owner: {owner}\n🆔 Session: {session}',
    deploy_fail: '❌ Deployment failed: {error}',
    deploy_limit: '🚫 Maximum deployment limit ({max}) reached.',
    deploy_invalid_session: '❌ Invalid session ID format.',
    deploy_list: '📋 *Active Deployments:*\n{list}',

    // --- SETLANG ---
    lang_changed: '🌐 Language changed to *{lang}*!',
    lang_invalid: '❌ Invalid language! Available: *en, fr, es*',

    // --- STICKER ---
    sticker_creating: '🖼️ Creating sticker...',
    sticker_done: '✅ Sticker created!',
    sticker_error: '❌ Failed to create sticker.',

    // --- DOWNLOAD ---
    dl_searching: '🔍 Searching for *{query}*...',
    dl_found: '✅ Found! Downloading...',
    dl_done: '✅ Download complete!',
    dl_error: '❌ Download failed: {error}',
    dl_size_limit: '❌ File too large! Max size: {size}MB',

    // --- AI ---
    ai_thinking: '🤖 Thinking...',
    ai_error: '❌ AI error: {error}',

    // --- GAME ---
    game_ttt_turn: '🎮 *Tic-Tac-Toe*\n{board}\n🎯 Turn: *{player}*',
    game_ttt_win: '🏆 *{player}* wins!',
    game_ttt_draw: "🤝 It's a draw!",
    game_quiz_question: '❓ *Quiz*\n{question}\n\nA) {a}\nB) {b}\nC) {c}\nD) {d}',
    game_quiz_correct: '✅ Correct! +{points} points',
    game_quiz_wrong: '❌ Wrong! The answer was *{answer}*',

    // --- INFO ---
    bot_info: `╔══════════════════════╗
║    *BOT INFORMATION*    ║
╚══════════════════════╝
🤖 *Name:* {botname}
👑 *Owner:* {owner}
📦 *Commands:* {count}
🌐 *Language:* {lang}
⚡ *Prefix:* {prefix}
🕐 *Uptime:* {uptime}
📅 *Version:* 3.0.0
🔗 *GitHub:* github.com/INCONNU-BOY`,

    // --- RUNTIME ---
    uptime_format: '{d}d {h}h {m}m {s}s',
  },

  fr: {
    // --- GENERAL ---
    loading: '⏳ Chargement...',
    error: '❌ Une erreur est survenue : {error}',
    success: '✅ Terminé !',
    no_permission: '🚫 Vous n\'avez pas la permission d\'utiliser cette commande.',
    owner_only: '👑 Cette commande est réservée au propriétaire du bot.',
    admin_only: '🛡️ Cette commande est réservée aux administrateurs du groupe.',
    bot_admin_required: '🤖 Le bot doit être administrateur pour utiliser cette commande.',
    group_only: '👥 Cette commande ne peut être utilisée que dans les groupes.',
    private_only: '💬 Cette commande ne peut être utilisée qu\'en chat privé.',
    invalid_usage: '❌ Utilisation invalide !\n📌 Utilisation : {usage}',
    reply_required: '↩️ Veuillez répondre à un message pour utiliser cette commande.',
    wait: '⏳ Veuillez patienter...',
    done: '✅ Terminé !',
    not_found: '❌ Introuvable : {item}',
    disabled: '🚫 Cette fonctionnalité est désactivée.',
    enabled_msg: '✅ {feature} a été activé.',
    disabled_msg: '🚫 {feature} a été désactivé.',

    // --- PING ---
    ping_response: '🏓 *Pong !*\n⚡ Temps de réponse : *{time}ms*\n🤖 Bot : *{botname}*\n📅 Date : *{date}*\n🌐 Langue : *{lang}*',

    // --- MENU ---
    menu_header: `╔═══════════════════════╗
║   *{botname}*   ║
╚═══════════════════════╝
👤 Utilisateur : {user}
📅 Date : {date}
⚡ Préfixe : *{prefix}*
📦 Commandes : *{count}*
🌐 Langue : *{lang}*
🕐 Uptime : *{uptime}*`,
    menu_footer: `> ⭐ *INCONNU XD V3* | par INCONNU BOY`,
    menu_cat_owner: '👑 PROPRIÉTAIRE',
    menu_cat_admin: '🛡️ ADMIN',
    menu_cat_group: '👥 GROUPE',
    menu_cat_fun: '🎉 AMUSEMENT',
    menu_cat_media: '🎵 MÉDIAS',
    menu_cat_utility: '🔧 UTILITAIRES',
    menu_cat_ai: '🤖 IA',
    menu_cat_nsfw: '🔞 NSFW',
    menu_cat_info: 'ℹ️ INFO',
    menu_cat_download: '⬇️ TÉLÉCHARGEMENT',
    menu_cat_social: '🌐 SOCIAL',
    menu_cat_game: '🎮 JEUX',
    menu_cat_sticker: '🖼️ STICKER',
    menu_cat_convert: '🔄 CONVERSION',

    // --- ANTI-BOT ---
    antibot_kick: '🤖 *Anti-Bot Activé !*\n👋 Le bot *{number}* a été retiré du groupe.',
    antibot_warn: '⚠️ Les bots ne sont pas autorisés dans ce groupe !',

    // --- ANTI-LINK ---
    antilink_warn: '🔗 *Avertissement Anti-Lien !*\n⚠️ Les liens ne sont pas autorisés !\n👤 Utilisateur : @{number}\n⚡ Action : *{action}*',
    antilink_delete: '🗑️ Message supprimé.',
    antilink_kick: '👋 Utilisateur expulsé pour envoi de lien.',

    // --- ANTI-DELETE ---
    antidelete_header: '🗑️ *Message Supprimé !*\n👤 De : @{number}\n👥 Groupe : {group}\n📝 Contenu :',

    // --- ANTI-TAG ---
    antitag_warn: '🏷️ *Avertissement Anti-Tag !*\n⚠️ Taguer tout le monde n\'est pas autorisé !\n👤 Utilisateur : @{number}',

    // --- WELCOME/GOODBYE ---
    welcome_default: '👋 Bienvenue dans *{group}*, @{number} !\n👥 Membres : *{members}*\nBonne visite ! 🎉',
    goodbye_default: '😢 *@{number}* a quitté *{group}*.\nAu revoir ! 👋\n👥 Membres : *{members}*',

    // --- DEPLOY ---
    deploy_start: '🚀 *Déploiement de votre bot...*\n⏳ Cela peut prendre quelques minutes.',
    deploy_success: '✅ *Bot déployé avec succès !*\n🔗 Votre bot est en ligne !\n👑 Propriétaire : {owner}\n🆔 Session : {session}',
    deploy_fail: '❌ Échec du déploiement : {error}',
    deploy_limit: '🚫 Limite de déploiement ({max}) atteinte.',
    deploy_invalid_session: '❌ Format de session invalide.',
    deploy_list: '📋 *Déploiements Actifs :*\n{list}',

    // --- SETLANG ---
    lang_changed: '🌐 Langue changée en *{lang}* !',
    lang_invalid: '❌ Langue invalide ! Disponibles : *en, fr, es*',

    // --- STICKER ---
    sticker_creating: '🖼️ Création du sticker...',
    sticker_done: '✅ Sticker créé !',
    sticker_error: '❌ Échec de la création du sticker.',

    // --- DOWNLOAD ---
    dl_searching: '🔍 Recherche de *{query}*...',
    dl_found: '✅ Trouvé ! Téléchargement...',
    dl_done: '✅ Téléchargement terminé !',
    dl_error: '❌ Échec du téléchargement : {error}',
    dl_size_limit: '❌ Fichier trop volumineux ! Max : {size}MB',

    // --- AI ---
    ai_thinking: '🤖 Réflexion en cours...',
    ai_error: '❌ Erreur IA : {error}',

    // --- GAME ---
    game_ttt_turn: '🎮 *Morpion*\n{board}\n🎯 Tour : *{player}*',
    game_ttt_win: '🏆 *{player}* gagne !',
    game_ttt_draw: '🤝 Match nul !',
    game_quiz_question: '❓ *Quiz*\n{question}\n\nA) {a}\nB) {b}\nC) {c}\nD) {d}',
    game_quiz_correct: '✅ Correct ! +{points} points',
    game_quiz_wrong: '❌ Mauvaise réponse ! La bonne réponse était *{answer}*',

    // --- INFO ---
    bot_info: `╔══════════════════════╗
║  *INFORMATIONS DU BOT*  ║
╚══════════════════════╝
🤖 *Nom :* {botname}
👑 *Propriétaire :* {owner}
📦 *Commandes :* {count}
🌐 *Langue :* {lang}
⚡ *Préfixe :* {prefix}
🕐 *Uptime :* {uptime}
📅 *Version :* 3.0.0
🔗 *GitHub :* github.com/INCONNU-BOY`,

    // --- RUNTIME ---
    uptime_format: '{d}j {h}h {m}m {s}s',
  },

  es: {
    // --- GENERAL ---
    loading: '⏳ Cargando...',
    error: '❌ Ocurrió un error: {error}',
    success: '✅ ¡Listo!',
    no_permission: '🚫 No tienes permiso para usar este comando.',
    owner_only: '👑 Este comando es solo para el dueño del bot.',
    admin_only: '🛡️ Este comando es solo para administradores del grupo.',
    bot_admin_required: '🤖 El bot debe ser administrador para usar este comando.',
    group_only: '👥 Este comando solo puede usarse en grupos.',
    private_only: '💬 Este comando solo puede usarse en chat privado.',
    invalid_usage: '❌ ¡Uso inválido!\n📌 Uso: {usage}',
    reply_required: '↩️ Por favor responde a un mensaje para usar este comando.',
    wait: '⏳ Por favor espera...',
    done: '✅ ¡Listo!',
    not_found: '❌ No encontrado: {item}',
    disabled: '🚫 Esta función está desactivada.',
    enabled_msg: '✅ {feature} ha sido activado.',
    disabled_msg: '🚫 {feature} ha sido desactivado.',

    // --- PING ---
    ping_response: '🏓 *¡Pong!*\n⚡ Tiempo de respuesta: *{time}ms*\n🤖 Bot: *{botname}*\n📅 Fecha: *{date}*\n🌐 Idioma: *{lang}*',

    // --- MENU ---
    menu_header: `╔═══════════════════════╗
║   *{botname}*   ║
╚═══════════════════════╝
👤 Usuario: {user}
📅 Fecha: {date}
⚡ Prefijo: *{prefix}*
📦 Comandos: *{count}*
🌐 Idioma: *{lang}*
🕐 Uptime: *{uptime}*`,
    menu_footer: `> ⭐ *INCONNU XD V3* | por INCONNU BOY`,
    menu_cat_owner: '👑 DUEÑO',
    menu_cat_admin: '🛡️ ADMIN',
    menu_cat_group: '👥 GRUPO',
    menu_cat_fun: '🎉 DIVERSIÓN',
    menu_cat_media: '🎵 MEDIOS',
    menu_cat_utility: '🔧 UTILIDADES',
    menu_cat_ai: '🤖 IA',
    menu_cat_nsfw: '🔞 NSFW',
    menu_cat_info: 'ℹ️ INFO',
    menu_cat_download: '⬇️ DESCARGA',
    menu_cat_social: '🌐 SOCIAL',
    menu_cat_game: '🎮 JUEGOS',
    menu_cat_sticker: '🖼️ STICKER',
    menu_cat_convert: '🔄 CONVERTIR',

    // --- ANTI-BOT ---
    antibot_kick: '🤖 *¡Anti-Bot Activado!*\n👋 El bot *{number}* fue eliminado del grupo.',
    antibot_warn: '⚠️ ¡Los bots no están permitidos en este grupo!',

    // --- ANTI-LINK ---
    antilink_warn: '🔗 *¡Advertencia Anti-Link!*\n⚠️ ¡Los enlaces no están permitidos!\n👤 Usuario: @{number}\n⚡ Acción: *{action}*',
    antilink_delete: '🗑️ Mensaje eliminado.',
    antilink_kick: '👋 Usuario expulsado por enviar un enlace.',

    // --- ANTI-DELETE ---
    antidelete_header: '🗑️ *¡Mensaje Eliminado!*\n👤 De: @{number}\n👥 Grupo: {group}\n📝 Contenido:',

    // --- ANTI-TAG ---
    antitag_warn: '🏷️ *¡Advertencia Anti-Tag!*\n⚠️ ¡Etiquetar a todos no está permitido!\n👤 Usuario: @{number}',

    // --- WELCOME/GOODBYE ---
    welcome_default: '👋 Bienvenido/a a *{group}*, @{number}!\n👥 Miembros: *{members}*\n¡Disfruta tu estadía! 🎉',
    goodbye_default: '😢 *@{number}* ha salido de *{group}*.\n¡Hasta luego! 👋\n👥 Miembros: *{members}*',

    // --- DEPLOY ---
    deploy_start: '🚀 *Desplegando tu bot...*\n⏳ Esto puede tardar unos minutos.',
    deploy_success: '✅ *¡Bot desplegado con éxito!*\n🔗 ¡Tu bot está en línea!\n👑 Dueño: {owner}\n🆔 Sesión: {session}',
    deploy_fail: '❌ Fallo en el despliegue: {error}',
    deploy_limit: '🚫 Límite de despliegue ({max}) alcanzado.',
    deploy_invalid_session: '❌ Formato de sesión inválido.',
    deploy_list: '📋 *Despliegues Activos:*\n{list}',

    // --- SETLANG ---
    lang_changed: '🌐 ¡Idioma cambiado a *{lang}*!',
    lang_invalid: '❌ ¡Idioma inválido! Disponibles: *en, fr, es*',

    // --- STICKER ---
    sticker_creating: '🖼️ Creando sticker...',
    sticker_done: '✅ ¡Sticker creado!',
    sticker_error: '❌ Error al crear el sticker.',

    // --- DOWNLOAD ---
    dl_searching: '🔍 Buscando *{query}*...',
    dl_found: '✅ ¡Encontrado! Descargando...',
    dl_done: '✅ ¡Descarga completa!',
    dl_error: '❌ Error al descargar: {error}',
    dl_size_limit: '❌ ¡Archivo muy grande! Máx: {size}MB',

    // --- AI ---
    ai_thinking: '🤖 Pensando...',
    ai_error: '❌ Error de IA: {error}',

    // --- GAME ---
    game_ttt_turn: '🎮 *Tres en Raya*\n{board}\n🎯 Turno: *{player}*',
    game_ttt_win: '🏆 ¡*{player}* gana!',
    game_ttt_draw: '🤝 ¡Empate!',
    game_quiz_question: '❓ *Quiz*\n{question}\n\nA) {a}\nB) {b}\nC) {c}\nD) {d}',
    game_quiz_correct: '✅ ¡Correcto! +{points} puntos',
    game_quiz_wrong: '❌ ¡Incorrecto! La respuesta era *{answer}*',

    // --- INFO ---
    bot_info: `╔══════════════════════╗
║  *INFO DEL BOT*  ║
╚══════════════════════╝
🤖 *Nombre:* {botname}
👑 *Dueño:* {owner}
📦 *Comandos:* {count}
🌐 *Idioma:* {lang}
⚡ *Prefijo:* {prefix}
🕐 *Uptime:* {uptime}
📅 *Versión:* 3.0.0
🔗 *GitHub:* github.com/INCONNU-BOY`,

    // --- RUNTIME ---
    uptime_format: '{d}d {h}h {m}m {s}s',
  }
};

/**
 * Translate a key with variable interpolation
 * @param {object|string} configOrLang - bot config object or lang string directly
 * @param {string} key - translation key
 * @param {object} vars - variables to interpolate
 * @returns {string}
 */
function t(configOrLang, key, vars = {}) {
  const lang = typeof configOrLang === 'string'
    ? configOrLang
    : (configOrLang?.language || configOrLang?.LANGUAGE || 'en');

  const langData = languages[lang] || languages['en'];
  let text = langData[key] || languages['en'][key] || key;

  // Replace variables
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v ?? '');
  }

  return text;
}

/**
 * Get available languages
 */
function getAvailableLanguages() {
  return Object.keys(languages);
}

/**
 * Check if language is valid
 */
function isValidLanguage(lang) {
  return Object.keys(languages).includes(lang);
}

module.exports = { t, getAvailableLanguages, isValidLanguage, languages };
