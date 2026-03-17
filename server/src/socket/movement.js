// Handler de mouvement
function setupMovementHandlers(socket, io, playerManager) {
  socket.on('playerMove', (data) => {
    const player = playerManager.updatePosition(socket.id, data.x, data.y, data.z);
    if (player) {
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        z: data.z
      });
    }
  });
}

module.exports = setupMovementHandlers;
