// PlayerSync - Synchronisation des joueurs distants
(function() {
  'use strict';

  window.PlayerSync = class PlayerSync {
    constructor(scene, socketClient) {
      this.scene = scene;
      this.socketClient = socketClient;
      this.otherPlayers = new Map(); // Map<playerId, OtherPlayer>
      
      this._setupCallbacks();
    }

    _setupCallbacks() {
      if (!this.socketClient) return;
      
      this.socketClient.callbacks.onCurrentPlayers = (players) => {
        players.forEach((playerData) => {
          if (playerData.id !== this.socketClient.getPlayerId()) {
            this.addPlayer(playerData);
          }
        });
      };

      this.socketClient.callbacks.onPlayerJoined = (playerData) => {
        this.addPlayer(playerData);
      };

      this.socketClient.callbacks.onPlayerMoved = (data) => {
        this.updatePlayerPosition(data.id, data.x, data.y, data.z);
      };

      this.socketClient.callbacks.onPlayerLeft = (playerId) => {
        this.removePlayer(playerId);
      };
    }

    addPlayer(playerData) {
      if (this.otherPlayers.has(playerData.id)) return;
      
      const otherPlayer = new window.OtherPlayer(this.scene, playerData);
      this.otherPlayers.set(playerData.id, otherPlayer);
    }

    removePlayer(playerId) {
      const player = this.otherPlayers.get(playerId);
      if (player) {
        player.destroy();
        this.otherPlayers.delete(playerId);
      }
    }

    updatePlayerPosition(playerId, x, y, z) {
      const player = this.otherPlayers.get(playerId);
      if (player) {
        player.setTargetPosition(x, y, z);
      }
    }

    update() {
      this.otherPlayers.forEach((player) => {
        player.update();
      });
    }

    getPlayers() {
      return this.otherPlayers;
    }

    getPlayerById(id) {
      return this.otherPlayers.get(id);
    }

    getPlayersNear(position, radius) {
      const nearby = [];
      this.otherPlayers.forEach((player, id) => {
        const distance = position.distanceTo(player.getPosition());
        if (distance <= radius) {
          nearby.push({
            id: id,
            player: player,
            username: player.username,
            distance: distance
          });
        }
      });
      return nearby;
    }
  };

})();
