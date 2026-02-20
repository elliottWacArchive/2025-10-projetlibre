// Gestion de la connexion Socket.io et du multijoueur
(function(){
  'use strict';

  window.NetworkManager = class NetworkManager {
    constructor(game) {
      this.game = game;
      this.socket = null;
      this.playerId = null;
      this.otherPlayers = new Map(); // Map<playerId, mesh>
      this.serverUrl = window.SOCKET_SERVER_URL || 'http://localhost:3000';
      
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

    this._bindSocketEvents();
  }

  _bindSocketEvents() {
    // Connexion établie
    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur - ID:', this.socket.id);
      this._updateConnectionStatus(true);
    });

    // Initialisation du joueur
    this.socket.on('init', (data) => {
      console.log('🎮 Joueur initialisé:', data);
      this.playerId = data.playerId;
      
      // Mettre la couleur du joueur local
      if (this.game.player && data.player.color) {
        this.game.player.material.color.setHex(data.player.color);
      }
    });

    // Recevoir tous les joueurs actuels
    this.socket.on('currentPlayers', (players) => {
      console.log('👥 Joueurs actuels:', players.length);
      players.forEach((playerData) => {
        if (playerData.id !== this.playerId) {
          this._addOtherPlayer(playerData);
        }
      });
    });

    // Nouveau joueur rejoint
    this.socket.on('playerJoined', (playerData) => {
      console.log('➕ Nouveau joueur:', playerData.id);
      this._addOtherPlayer(playerData);
    });

    // Un joueur a bougé
    this.socket.on('playerMoved', (data) => {
      const otherPlayer = this.otherPlayers.get(data.id);
      if (otherPlayer) {
        otherPlayer.targetPos = new THREE.Vector3(data.x, data.y, data.z);
      }
    });

    // Un joueur est parti
    this.socket.on('playerLeft', (playerId) => {
      console.log('➖ Joueur parti:', playerId);
      this._removeOtherPlayer(playerId);
    });

    // Message chat
    this.socket.on('chatMessage', (data) => {
      console.log(`💬 [${data.username}]: ${data.message}`);
      this._displayChatMessage(data);
    });

    // Message privé reçu
    this.socket.on('privateMessage', (data) => {
      console.log(`🔒 Message privé de ${data.from}:`, data.message);
      if (this.game.interactions) {
        this.game.interactions.receivePrivateMessage(data);
      }
    });

    // Émote reçue
    this.socket.on('emote', (data) => {
      console.log(`👋 ${data.from} vous fait signe`);
      // TODO: afficher animation d'émote
    });

    // Déconnexion
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Déconnecté:', reason);
      this._updateConnectionStatus(false);
    });

    // Erreur de connexion
    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Erreur de connexion:', error.message);
      this._updateConnectionStatus(false);
    });

    // Reconnexion
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnecté après', attemptNumber, 'tentatives');
    });
  }

  // Ajouter un autre joueur à la scène
  _addOtherPlayer(playerData) {
    if (this.otherPlayers.has(playerData.id)) return;

    const geom = new THREE.BoxGeometry(10, 10, 10);
    const mat = new THREE.MeshStandardMaterial({ color: playerData.color || 0xff6b6b });
    const mesh = new THREE.Mesh(geom, mat);
    
    mesh.position.set(playerData.x, playerData.y, playerData.z);
    mesh.userData.playerId = playerData.id;
    mesh.userData.username = playerData.username;
    mesh.targetPos = null;
    
    this.game.scene.add(mesh);
    this.otherPlayers.set(playerData.id, mesh);

    // Ajouter un label avec le nom du joueur
    this._addPlayerLabel(mesh, playerData.username);
  }

  // Retirer un joueur de la scène
  _removeOtherPlayer(playerId) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      // Retirer le label si existant
      if (player.userData.label) {
        this.game.scene.remove(player.userData.label);
      }
      this.game.scene.remove(player);
      this.otherPlayers.delete(playerId);
    }
  }

  // Ajouter un label texte au-dessus du joueur
  _addPlayerLabel(mesh, username) {
    // Créer un canvas pour le texte
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'Bold 24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(username, 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(20, 5, 1);
    sprite.position.y = 15;
    
    mesh.add(sprite);
    mesh.userData.label = sprite;
  }

  // Envoyer la position du joueur au serveur
  sendPlayerPosition(x, y, z) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('playerMove', { x: x, y: y, z: z });
    }
  }

  // Envoyer un message chat
  sendChatMessage(message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('chatMessage', message);
    }
  }

  // Afficher un message chat dans l'UI
  _displayChatMessage(data) {
    // TODO: créer une UI de chat
    let chatDiv = document.getElementById('chat-messages');
    if (!chatDiv) {
      chatDiv = document.createElement('div');
      chatDiv.id = 'chat-messages';
      chatDiv.style.cssText = 'position:absolute;bottom:20px;left:200px;max-width:400px;max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.7);padding:10px;border-radius:8px;font-size:12px;color:white;';
      document.body.appendChild(chatDiv);
    }
    
    const msgEl = document.createElement('div');
    msgEl.style.marginBottom = '5px';
    msgEl.innerHTML = '<strong>' + data.username + ':</strong> ' + data.message;
    chatDiv.appendChild(msgEl);
    
    // Auto-scroll
    chatDiv.scrollTop = chatDiv.scrollHeight;
    
    // Limiter à 50 messages
    while (chatDiv.children.length > 50) {
      chatDiv.removeChild(chatDiv.firstChild);
    }
  }

  // Mettre à jour le statut de connexion dans l'UI
  _updateConnectionStatus(connected) {
    let statusDiv = document.getElementById('connection-status');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.id = 'connection-status';
      statusDiv.style.cssText = 'position:absolute;top:50px;left:16px;padding:6px 12px;border-radius:6px;font-size:12px;color:white;';
      document.body.appendChild(statusDiv);
    }
    
    if (connected) {
      statusDiv.textContent = '🟢 Connecté';
      statusDiv.style.background = 'rgba(0,200,0,0.3)';
    } else {
      statusDiv.textContent = '🔴 Déconnecté';
      statusDiv.style.background = 'rgba(200,0,0,0.3)';
    }
  }

  // Mettre à jour les autres joueurs (interpolation)
  update() {
    this.otherPlayers.forEach((player) => {
      if (player.targetPos) {
        player.position.lerp(player.targetPos, 0.15);
        
        // Si très proche, snap
        if (player.position.distanceToSquared(player.targetPos) < 0.01) {
          player.position.copy(player.targetPos);
          player.targetPos = null;
        }
      }
    });
  }
  }; // Fin de la classe NetworkManager

})(); // Fin de la fonction IIFE
