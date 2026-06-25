const { WebSocketServer } = require('ws');

function setupWebSocket(server, app) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set();

  function broadcast(payload) {
    const message = JSON.stringify(payload);
    clients.forEach((ws) => {
      if (ws.readyState === 1) ws.send(message);
    });
  }

  app.locals.broadcast = broadcast;

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.send(JSON.stringify({ type: 'connected', data: { message: 'WebSocket connected' } }));
  });

  return { wss, broadcast };
}

module.exports = { setupWebSocket };
