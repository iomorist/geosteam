const http = require('http');
const { createApp } = require('./app');
const { setupWebSocket } = require('./websocket');

const PORT = process.env.PORT || 5000;

createApp().then((app) => {
  const server = http.createServer(app);
  setupWebSocket(server, app);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Geo Steam Analytics Server (MVC)`);
    console.log(`📁 Labs: http://localhost:${PORT}/labs/static/index.html`);
    console.log(`🏗  MVC:  http://localhost:${PORT}/mvc`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
