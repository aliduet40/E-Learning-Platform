// Tracks active SSE connections per instructor and broadcasts events.
// Map<instructorId:number, Set<res>>
const clients = new Map();

function subscribe(instructorId, res) {
  const id = Number(instructorId);
  if (!clients.has(id)) clients.set(id, new Set());
  clients.get(id).add(res);
}

function unsubscribe(instructorId, res) {
  const id = Number(instructorId);
  const set = clients.get(id);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(id);
}

function send(res, eventName, data) {
  try {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (typeof res.flush === "function") res.flush();
  } catch (err) {
    // Connection already closed; ignore.
  }
}

function broadcast(instructorId, eventName, data) {
  const set = clients.get(Number(instructorId));
  if (!set) return;
  set.forEach((res) => send(res, eventName, data));
}

function clientCount(instructorId) {
  const set = clients.get(Number(instructorId));
  return set ? set.size : 0;
}

module.exports = { subscribe, unsubscribe, send, broadcast, clientCount };
