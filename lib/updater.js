const axios  = require('axios');
const fs     = require('fs');
const path   = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const ROOT        = path.join(__dirname, '..');
const UPDATE_URL  = 'https://github.com/INCONNU-BOY/INCONNU-XD-V3/archive/refs/heads/main.zip';
const VERSION_URL = 'https://raw.githubusercontent.com/INCONNU-BOY/INCONNU-XD-V3/main/package.json';
const TMP_ZIP     = path.join(ROOT, '_update.zip');
const TMP_DIR     = path.join(ROOT, '_update_tmp');

// Skip these when updating (user data)
const SKIP_PATHS = ['auth', 'local_db', '.env', 'node_modules', '_update.zip', '_update_tmp'];

async function getRemoteVersion() {
  try {
    const res = await axios.get(VERSION_URL, { timeout: 10000 });
    return res.data?.version || null;
  } catch { return null; }
}

function getLocalVersion() {
  try { return require(path.join(ROOT, 'package.json')).version; } catch { return '0.0.0'; }
}

function versionGt(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i]||0) > (pb[i]||0)) return true;
    if ((pa[i]||0) < (pb[i]||0)) return false;
  }
  return false;
}

async function checkUpdate() {
  const remote = await getRemoteVersion();
  const local  = getLocalVersion();
  if (!remote) return { hasUpdate: false, local, remote: null };
  return { hasUpdate: versionGt(remote, local), local, remote };
}

async function downloadAndApplyUpdate(onProgress) {
  try {
    onProgress?.('⬇️ Downloading update...');

    // Download ZIP
    const res = await axios.get(UPDATE_URL, { responseType: 'arraybuffer', timeout: 60000 });
    fs.writeFileSync(TMP_ZIP, Buffer.from(res.data));
    onProgress?.('📦 Extracting...');

    // Extract
    if (fs.existsSync(TMP_DIR)) fs.rmSync(TMP_DIR, { recursive: true, force: true });
    fs.mkdirSync(TMP_DIR, { recursive: true });
    await execAsync(`unzip -o "${TMP_ZIP}" -d "${TMP_DIR}"`);

    // Find extracted folder
    const extracted = fs.readdirSync(TMP_DIR)[0];
    if (!extracted) throw new Error('Empty ZIP');
    const srcDir = path.join(TMP_DIR, extracted);

    onProgress?.('🔄 Applying update...');

    // Copy files recursively, skip protected paths
    function copyDir(src, dest) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      for (const entry of fs.readdirSync(src)) {
        // Skip protected
        if (SKIP_PATHS.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        if (fs.statSync(s).isDirectory()) {
          copyDir(s, d);
        } else {
          fs.copyFileSync(s, d);
        }
      }
    }
    copyDir(srcDir, ROOT);

    // Cleanup
    fs.rmSync(TMP_ZIP, { force: true });
    fs.rmSync(TMP_DIR, { recursive: true, force: true });

    onProgress?.('📦 Installing dependencies...');
    await execAsync('npm install --prefix ' + ROOT);

    onProgress?.('✅ Update applied! Restarting...');
    setTimeout(() => process.exit(0), 2000);
    return { success: true };
  } catch (e) {
    try { fs.rmSync(TMP_ZIP, { force: true }); } catch {}
    try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch {}
    return { success: false, error: e.message };
  }
}

module.exports = { checkUpdate, downloadAndApplyUpdate, getLocalVersion };
