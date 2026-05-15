const { File } = require('megajs');
const fs   = require('fs');
const path = require('path');

async function downloadSessionData(sessionId, authDir) {
  console.log('🔍 SESSION_ID:', sessionId ? sessionId.substring(0, 20) + '...' : 'NONE');
  if (!sessionId) { console.error('❌ No SESSION_ID'); return false; }

  const encoded = sessionId.split('INCONNU~XD~')[1];
  if (!encoded || !encoded.includes('#')) {
    console.error('❌ Invalid SESSION_ID format');
    return false;
  }

  const [fileId, decryptionKey] = encoded.split('#');
  if (!authDir) authDir = path.join(__dirname, '../auth/main');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const credsPath = path.join(authDir, 'creds.json');

  try {
    console.log('🔄 Downloading session from MEGA...');
    const sessionFile = File.fromURL(`https://mega.nz/file/${fileId}#${decryptionKey}`);
    const buffer = await new Promise((resolve, reject) => {
      sessionFile.download((error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    await fs.promises.writeFile(credsPath, buffer);
    console.log('🔒 Session loaded!');
    return true;
  } catch (e) {
    console.error('❌ MEGA download failed:', e.message);
    return false;
  }
}

function sessionExists(authDir) {
  const d = authDir || path.join(__dirname, '../auth/main');
  return fs.existsSync(path.join(d, 'creds.json'));
}

module.exports = { downloadSessionData, sessionExists };
