const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configuration CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));

// Socket.io avec CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// État du jeu - stockage des joueurs
const players = new Map();

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    players: players.size,
    uptime: process.uptime()
  });
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Joueur connecté: ${socket.id}`);

  // Initialiser le joueur
  const newPlayer = {
    id: socket.id,
    x: 0,
    y: 5,
    z: 0,
    color: getRandomColor(),
    username: `Player_${Math.floor(Math.random() * 1000)}`,
    connected: Date.now()
  };

  players.set(socket.id, newPlayer);

  // Envoyer au nouveau joueur sa propre info
  socket.emit('init', {
    playerId: socket.id,
    player: newPlayer
  });

  // Envoyer tous les joueurs existants au nouveau joueur
  socket.emit('currentPlayers', Array.from(players.values()));

  // Notifier les autres joueurs du nouveau joueur
  socket.broadcast.emit('playerJoined', newPlayer);

  // Recevoir les mouvements du joueur
  socket.on('playerMove', (data) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      player.z = data.z;
      
      // Diffuser le mouvement aux autres joueurs
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        z: data.z
      });
    }
  });

  // Message chat
  socket.on('chatMessage', (message) => {
    const player = players.get(socket.id);
    if (player) {
      io.emit('chatMessage', {
        playerId: socket.id,
        username: player.username,
        message: message,
        timestamp: Date.now()
      });
    }
  });

  // Message privé
  socket.on('privateMessage', (data) => {
    const sender = players.get(socket.id);
    if (sender && data.to && data.message) {
      // Envoyer au destinataire
      io.to(data.to).emit('privateMessage', {
        from: socket.id,
        fromUsername: sender.username,
        message: data.message,
        timestamp: Date.now()
      });
      
      console.log(`📧 Message privé de ${sender.username} à ${data.to}`);
    }
  });

  // Émote
  socket.on('emote', (data) => {
    const sender = players.get(socket.id);
    if (sender && data.to && data.type) {
      io.to(data.to).emit('emote', {
        from: socket.id,
        fromUsername: sender.username,
        type: data.type,
        timestamp: Date.now()
      });
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Joueur déconnecté: ${socket.id}`);
    players.delete(socket.id);
    
    // Notifier les autres joueurs
    socket.broadcast.emit('playerLeft', socket.id);
  });

  // Gestion d'erreurs
  socket.on('error', (error) => {
    console.error(`Erreur socket ${socket.id}:`, error);
  });
});

// Démarrage du serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Monitoring: http://localhost:${PORT}/health\n`);
});

// Utilitaire: générer une couleur aléatoire
function getRandomColor() {
  const colors = [
    0x66ccff, // bleu clair
    0xff6b6b, // rouge
    0x4ecdc4, // cyan
    0xffe66d, // jaune
    0x95e1d3, // vert menthe
    0xf38181, // rose
    0xaa96da, // violet
    0xfcbad3  // rose clair
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Gestion des erreurs non catchées
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
