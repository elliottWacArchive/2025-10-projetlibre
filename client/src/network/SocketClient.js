// SocketClient - Connexion Socket.io pure
(function() {
  'use strict';

  window.SocketClient = class SocketClient {
    constructor(serverUrl, callbacks = {}) {
      this.serverUrl = serverUrl || window.SOCKET_SERVER_URL || 'http://localhost:3000';
      this.socket = null;
      this.playerId = null;
      this.callbacks = callbacks;
      this._init();
    }

    _init() {
      console.log('🔌 Connexion au serveur:', this.serverUrl);
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this._bindEvents();
    }

    _bindEvents() {
      this.socket.on('connect', () => {
        console.log('✅ Connecté au serveur - ID:', this.socket.id);
        if (this.callbacks.onConnect) this.callbacks.onConnect();
      });

      this.socket.on('init', (data) => {
        console.log('🎮 Joueur initialisé:', data);
        this.playerId = data.playerId;
        if (this.callbacks.onInit) this.callbacks.onInit(data);
      });

      this.socket.on('currentPlayers', (players) => {
        console.log('👥 Joueurs actuels:', players.length);
        if (this.callbacks.onCurrentPlayers) this.callbacks.onCurrentPlayers(players);
      });

      this.socket.on('playerJoined', (playerData) => {
        console.log('➕ Nouveau joueur:', playerData.id);
        if (this.callbacks.onPlayerJoined) this.callbacks.onPlayerJoined(playerData);
      });

      this.socket.on('playerMoved', (data) => {
        if (this.callbacks.onPlayerMoved) this.callbacks.onPlayerMoved(data);
      });

      this.socket.on('playerLeft', (playerId) => {
        console.log('➖ Joueur parti:', playerId);
        if (this.callbacks.onPlayerLeft) this.callbacks.onPlayerLeft(playerId);
      });

      this.socket.on('chatMessage', (data) => {
        console.log(`💬 [${data.username}]: ${data.message}`);
        if (this.callbacks.onChatMessage) this.callbacks.onChatMessage(data);
      });

      this.socket.on('privateMessage', (data) => {
        console.log(`🔒 Message privé de ${data.from}:`, data.message);
        if (this.callbacks.onPrivateMessage) this.callbacks.onPrivateMessage(data);
      });

      this.socket.on('emote', (data) => {
        console.log(`👋 ${data.from} vous fait signe`);
        if (this.callbacks.onEmote) this.callbacks.onEmote(data);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Déconnecté:', reason);
        if (this.callbacks.onDisconnect) this.callbacks.onDisconnect(reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('⚠️ Erreur de connexion:', error.message);
        if (this.callbacks.onError) this.callbacks.onError(error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnecté après', attemptNumber, 'tentatives');
        if (this.callbacks.onReconnect) this.callbacks.onReconnect(attemptNumber);
      });
    }

    emit(event, data) {
      if (this.socket && this.socket.connected) {
        this.socket.emit(event, data);
      }
    }

    sendPosition(x, y, z) {
      this.emit('playerMove', { x, y, z });
    }

    sendChatMessage(message) {
      this.emit('chatMessage', message);
    }

    sendPrivateMessage(to, message) {
      this.emit('privateMessage', { to, message });
    }

    sendEmote(to, type) {
      this.emit('emote', { to, type });
    }

    isConnected() {
      return this.socket && this.socket.connected;
    }

    getPlayerId() {
      return this.playerId;
    }

    getSocket() {
      return this.socket;
    }
  };

})();
