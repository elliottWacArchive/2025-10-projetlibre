// Handler de chat
function setupChatHandlers(socket, io, playerManager) {
  // Message public
  socket.on('chatMessage', (message) => {
    const player = playerManager.getPlayer(socket.id);
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
    const sender = playerManager.getPlayer(socket.id);
    if (sender && data.to && data.message) {
      io.to(data.to).emit('privateMessage', {
        from: socket.id,
        fromUsername: sender.username,
        message: data.message,
        timestamp: Date.now()
      });
      console.log(`📧 Message privé de ${sender.username} à ${data.to}`);
    }
  });
}

module.exports = setupChatHandlers;
