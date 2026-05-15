const lidCache = new Map(); // lid -> real jid

function storeLid(lid, jid) {
  if (lid && jid && lid.endsWith('@lid') && jid.endsWith('@s.whatsapp.net')) {
    lidCache.set(lid, jid);
  }
}

function getLidMapping(lid) {
  return lidCache.get(lid) || null;
}

function clearLidCache() { lidCache.clear(); }

/**
 * Resolve a JID that might be @lid to a real @s.whatsapp.net JID
 * Uses cache → groupMetadata → Baileys API fallbacks
 */
async function resolveLid(sock, jid, groupMeta = null) {
  if (!jid) return jid;

  // Already resolved
  if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us')) return jid;

  // Try cache first
  const cached = getLidMapping(jid);
  if (cached) return cached;

  // Try group metadata
  if (groupMeta?.participants) {
    for (const p of groupMeta.participants) {
      if (p.id === jid || p.lid === jid) {
        const resolved = p.pn || p.phoneNumber || p.jid;
        if (resolved?.endsWith('@s.whatsapp.net')) {
          storeLid(jid, resolved);
          return resolved;
        }
      }
    }
  }

  // Baileys API fallback
  if (sock) {
    try {
      if (sock.getJidFromLid) {
        const r = await sock.getJidFromLid(jid);
        if (r?.endsWith('@s.whatsapp.net')) { storeLid(jid, r); return r; }
      }
    } catch {}
    try {
      if (sock.lidToJid) {
        const r = await sock.lidToJid(jid);
        if (r?.endsWith('@s.whatsapp.net')) { storeLid(jid, r); return r; }
      }
    } catch {}
  }

  // Return as-is if unresolvable
  return jid;
}

/**
 * Normalize sender from a raw message key
 * Handles @lid, @s.whatsapp.net, participant, remoteJid
 */
async function normalizeSender(sock, key, groupMeta = null) {
  let sender = key.participantPn
    || key.participant
    || key.remoteJid;

  if (!sender) return null;

  // Strip device suffix e.g. 123:5@s.whatsapp.net → 123@s.whatsapp.net
  sender = sender.replace(/:[0-9]+@/, '@');

  return await resolveLid(sock, sender, groupMeta);
}

/**
 * Extract display number string from a JID
 * e.g. "2250700000000@s.whatsapp.net" → "2250700000000"
 */
function jidToNumber(jid) {
  if (!jid) return 'Unknown';
  return jid.split('@')[0].split(':')[0];
}

/**
 * Seed the lid cache from group metadata (call on every groupMetadata fetch)
 */
function seedLidFromMeta(meta) {
  if (!meta?.participants) return;
  for (const p of meta.participants) {
    if (p.lid && (p.pn || p.jid || p.phoneNumber)) {
      const real = p.pn || p.jid || p.phoneNumber;
      if (real.endsWith('@s.whatsapp.net')) {
        storeLid(p.lid, real);
      }
    }
  }
}

module.exports = { resolveLid, normalizeSender, storeLid, getLidMapping, clearLidCache, jidToNumber, seedLidFromMeta };
