const fs   = require('fs');
const path = require('path');

const commands   = new Map();
const aliases    = new Map();
const categories = new Map();

function loadCommands(cmdsDir) {
  const folders = fs.readdirSync(cmdsDir);
  let total = 0;

  for (const folder of folders) {
    const folderPath = path.join(cmdsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files   = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    const catCmds = [];

    for (const file of files) {
      try {
        const cmdPath = path.join(folderPath, file);
        delete require.cache[require.resolve(cmdPath)];
        const cmd = require(cmdPath);
        if (!cmd.name) continue;

        commands.set(cmd.name.toLowerCase(), cmd);
        catCmds.push(cmd.name.toLowerCase());
        total++;

        if (Array.isArray(cmd.aliases)) {
          for (const alias of cmd.aliases) {
            aliases.set(alias.toLowerCase(), cmd.name.toLowerCase());
          }
        }
      } catch (e) {
        console.error(`❌ Load error [${file}]:`, e.message);
      }
    }

    if (catCmds.length) categories.set(folder, catCmds);
  }

  console.log(`✅ ${total} commands in ${categories.size} categories`);
  return total;
}

function getCommand(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  return commands.get(lower) || commands.get(aliases.get(lower)) || null;
}

function getAllCommands()  { return commands; }
function getAllCategories(){ return categories; }
function getTotalCount()  { return commands.size; }

module.exports = { loadCommands, getCommand, getAllCommands, getAllCategories, getTotalCount };
