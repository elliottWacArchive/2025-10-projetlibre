// Handler d'émotes
function setupEmoteHandlers(socket, io, playerManager) {
  socket.on('emote', (data) => {
    const sender = playerManager.getPlayer(socket.id);
    if (sender && data.to && data.type) {
      io.to(data.to).emit('emote', {
        from: socket.id,
        fromUsername: sender.username,
        type: data.type,
        timestamp: Date.now()
      });
    }
  });
}

module.exports = setupEmoteHandlers;
