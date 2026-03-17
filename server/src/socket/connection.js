// Handler de connexion/déconnexion
function setupConnectionHandlers(socket, io, playerManager) {
  const timestamp = () => `[${new Date().toISOString()}]`;

  // Créer le joueur
  const newPlayer = playerManager.createPlayer(socket.id);
  console.log(`${timestamp()} Joueur connecté: ${socket.id}`);

  // Envoyer au nouveau joueur sa propre info
  socket.emit('init', {
    playerId: socket.id,
    player: newPlayer
  });

  // Envoyer tous les joueurs existants
  socket.emit('currentPlayers', playerManager.getAllPlayers());

  // Notifier les autres
  socket.broadcast.emit('playerJoined', newPlayer);

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`${timestamp()} Joueur déconnecté: ${socket.id}`);
    playerManager.removePlayer(socket.id);
    socket.broadcast.emit('playerLeft', socket.id);
  });

  // Erreur
  socket.on('error', (error) => {
    console.error(`Erreur socket ${socket.id}:`, error);
  });
}

module.exports = setupConnectionHandlers;
