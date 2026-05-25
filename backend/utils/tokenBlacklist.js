// In-memory JWT revocation list.
// Token -> expiresAt (ms since epoch). Once a token is past its own `exp`,
// it's already invalid via JWT verification, so we can prune it from memory.
const blacklist = new Map();

function add(token, expSeconds) {
  if (!token || !expSeconds) return;
  blacklist.set(token, expSeconds * 1000);
}

function isBlacklisted(token) {
  if (!token) return false;
  const exp = blacklist.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

function size() {
  return blacklist.size;
}

// Periodically prune expired entries so the map doesn't grow forever
// in long-running processes.
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const interval = setInterval(() => {
  const now = Date.now();
  for (const [token, exp] of blacklist) {
    if (now > exp) blacklist.delete(token);
  }
}, CLEANUP_INTERVAL_MS);
if (interval.unref) interval.unref(); // don't keep the event loop alive just for this

module.exports = { add, isBlacklisted, size };
