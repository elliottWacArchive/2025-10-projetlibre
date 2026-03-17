// PlayerManager - Gestion des joueurs connectés
const { getRandomColor, generateUsername } = require('../utils/colors');

class PlayerManager {
  constructor() {
    this.players = new Map();
  }

  createPlayer(socketId) {
    const player = {
      id: socketId,
      x: 0,
      y: 5,
      z: 0,
      color: getRandomColor(),
      username: generateUsername(),
      connected: Date.now()
    };
    this.players.set(socketId, player);
    return player;
  }

  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  updatePosition(socketId, x, y, z) {
    const player = this.players.get(socketId);
    if (player) {
      player.x = x;
      player.y = y;
      player.z = z;
    }
    return player;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getPlayerCount() {
    return this.players.size;
  }
}

module.exports = PlayerManager;
