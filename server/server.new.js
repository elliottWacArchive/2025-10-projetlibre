// Serveur principal (Version modulaire)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Config & modules
const config = require('./src/config');
const PlayerManager = require('./src/game/PlayerManager');
const setupConnectionHandlers = require('./src/socket/connection');
const setupMovementHandlers = require('./src/socket/movement');
const setupChatHandlers = require('./src/socket/chat');
const setupEmoteHandlers = require('./src/socket/emotes');

// Express
const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));

// Socket.io
const io = new Server(server, {
  cors: config.CORS_OPTIONS
});

// Game state
const playerManager = new PlayerManager();

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    players: playerManager.getPlayerCount(),
    uptime: process.uptime()
  });
});

// Gestion des connexions
io.on('connection', (socket) => {
  setupConnectionHandlers(socket, io, playerManager);
  setupMovementHandlers(socket, io, playerManager);
  setupChatHandlers(socket, io, playerManager);
  setupEmoteHandlers(socket, io, playerManager);
});

// Démarrage
server.listen(config.PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur démarré sur le port ${config.PORT}`);
  console.log(`📊 Monitoring: http://localhost:${config.PORT}/health\n`);
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
