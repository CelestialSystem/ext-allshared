const WebSocket = require('ws');

let globalWSS = null;

function createCustomWebSocketServer(server) {
  const wss = new WebSocket.Server({ noServer: true });
  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
      ws.handleUpgrade(req, socket, head, (ws) => {
        ws.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    console.log('[CustomWS] client connected');

    ws.on('message', (msg) => {
      console.log('[CustomWS] received:', msg.toString());
    });

  });

  globalWSS = wss;

  return wss;
}

// Export send method to be used from elsewhere (e.g., Ext plugin)
function sendToAllClients(payload) {
  if (!globalWSS) return;
  const msg = JSON.stringify([{path:payload}]);
  console.log("globalWSS.clients", globalWSS.clients.length)
  for (const client of globalWSS.clients) {
    if (client.readyState === WebSocket.OPEN) {
      console.log('sending messages to clients',msg);
      client.send(msg);
    }
  }
}

module.exports = {
  createCustomWebSocketServer,
  sendToAllClients,
};