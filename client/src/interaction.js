// Gestionnaire d'interactions et collisions
(function(){
  'use strict';

  window.InteractionManager = class InteractionManager {
    constructor(game) {
      this.game = game;
      this.interactionRadius = 50; // Zone d'interaction élargie (environ 4 cases de grille)
      this.nearbyPlayers = [];
      this.interactionMenu = null;
      this.isMenuOpen = false;
      
      this._createUI();
      this._bindEvents();
    }

  // Créer l'interface du menu d'interaction
  _createUI() {
    // Menu d'interactions
    const menu = document.createElement('div');
    menu.id = 'interaction-menu';
    menu.className = 'interaction-menu hidden';
    menu.innerHTML = `
      <div class="interaction-menu-header">
        <h3>Interactions disponibles</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="interaction-menu-content">
        <!-- Les options seront ajoutées dynamiquement -->
      </div>
    `;
    document.body.appendChild(menu);
    this.interactionMenu = menu;

    // Indicateur de zone d'interaction
    const indicator = document.createElement('div');
    indicator.id = 'interaction-indicator';
    indicator.className = 'interaction-indicator hidden';
    indicator.innerHTML = '<span class="indicator-text">Appuyez sur E pour interagir</span>';
    document.body.appendChild(indicator);
    this.interactionIndicator = indicator;
  }

  // Lier les événements
  _bindEvents() {
    // Fermer le menu
    const closeBtn = this.interactionMenu.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      this.closeMenu();
    });

    // Touche E pour ouvrir le menu d'interaction
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'e' && !this.isMenuOpen) {
        if (this.nearbyPlayers.length > 0) {
          this.openMenu();
        }
      } else if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Clic sur une option d'interaction
    this.interactionMenu.addEventListener('click', (e) => {
      if (e.target.classList.contains('interaction-option')) {
        const action = e.target.dataset.action;
        const playerId = e.target.dataset.playerId;
        this.handleInteraction(action, playerId);
      }
    });
  }

  // Vérifier les collisions et interactions
  update() {
    if (!this.game.network || !this.game.player) return;

    this.nearbyPlayers = [];
    const playerPos = this.game.player.position;

    // Vérifier la distance avec chaque autre joueur
    this.game.network.otherPlayers.forEach((otherPlayer, playerId) => {
      const distance = playerPos.distanceTo(otherPlayer.position);
      
      if (distance <= this.interactionRadius) {
        this.nearbyPlayers.push({
          id: playerId,
          mesh: otherPlayer,
          username: otherPlayer.userData.username,
          distance: distance
        });
      }
    });

    // Mettre à jour l'indicateur
    this._updateIndicator();
  }

  // Mettre à jour l'indicateur d'interaction
  _updateIndicator() {
    if (this.nearbyPlayers.length > 0 && !this.isMenuOpen) {
      this.interactionIndicator.classList.remove('hidden');
      const count = this.nearbyPlayers.length;
      const text = count === 1 
        ? 'Appuyez sur E pour interagir avec ' + this.nearbyPlayers[0].username
        : 'Appuyez sur E pour interagir (' + count + ' joueurs à proximité)';
      this.interactionIndicator.querySelector('.indicator-text').textContent = text;
    } else {
      this.interactionIndicator.classList.add('hidden');
    }
  }

  // Ouvrir le menu d'interactions
  openMenu() {
    if (this.nearbyPlayers.length === 0) return;

    this.isMenuOpen = true;
    const content = this.interactionMenu.querySelector('.interaction-menu-content');
    content.innerHTML = '';

    // Si un seul joueur, interaction directe
    if (this.nearbyPlayers.length === 1) {
      const player = this.nearbyPlayers[0];
      content.innerHTML = this._generateSinglePlayerOptions(player);
    } 
    // Si plusieurs joueurs, afficher la liste
    else {
      this.nearbyPlayers.forEach((player) => {
        const playerSection = document.createElement('div');
        playerSection.className = 'player-interaction-section';
        playerSection.innerHTML = `
          <div class="player-header">
            <strong>${player.username}</strong>
            <span class="distance">${Math.round(player.distance)} unités</span>
          </div>
          ${this._generateSinglePlayerOptions(player)}
        `;
        content.appendChild(playerSection);
      });
    }

    this.interactionMenu.classList.remove('hidden');
    this.interactionIndicator.classList.add('hidden');
  }

  // Générer les options pour un joueur
  _generateSinglePlayerOptions(player) {
    return `
      <div class="interaction-options">
        <button class="interaction-option" data-action="message" data-player-id="${player.id}">
          <span class="icon">💬</span>
          <span class="label">Envoyer un message</span>
        </button>
        <button class="interaction-option" data-action="trade" data-player-id="${player.id}">
          <span class="icon">🔄</span>
          <span class="label">Échanger des objets</span>
        </button>
        <button class="interaction-option" data-action="follow" data-player-id="${player.id}">
          <span class="icon">👣</span>
          <span class="label">Suivre</span>
        </button>
        <button class="interaction-option" data-action="wave" data-player-id="${player.id}">
          <span class="icon">👋</span>
          <span class="label">Saluer</span>
        </button>
      </div>
    `;
  }

  // Fermer le menu
  closeMenu() {
    this.isMenuOpen = false;
    this.interactionMenu.classList.add('hidden');
    this._updateIndicator();
  }

  // Gérer une interaction
  handleInteraction(action, playerId) {
    const player = this.nearbyPlayers.find(p => p.id === playerId);
    if (!player) return;

    console.log('Interaction:', action, 'avec', player.username);

    switch (action) {
      case 'message':
        this.openMessageDialog(player);
        break;
      case 'trade':
        this.openTradeDialog(player);
        break;
      case 'follow':
        this.startFollowing(player);
        break;
      case 'wave':
        this.sendWave(player);
        break;
    }

    this.closeMenu();
  }

  // Ouvrir la messagerie instantanée
  openMessageDialog(player) {
    // Créer une fenêtre de chat privé
    const dialog = document.createElement('div');
    dialog.id = 'message-dialog';
    dialog.className = 'message-dialog';
    dialog.innerHTML = `
      <div class="message-dialog-header">
        <h3>Message à ${player.username}</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="message-dialog-body">
        <div class="message-history" id="message-history-${player.id}"></div>
        <div class="message-input-container">
          <input type="text" class="message-input" placeholder="Tapez votre message..." maxlength="200">
          <button class="send-btn">Envoyer</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);

    // Fermer
    dialog.querySelector('.close-btn').addEventListener('click', () => {
      dialog.remove();
    });

    // Envoyer message
    const input = dialog.querySelector('.message-input');
    const sendBtn = dialog.querySelector('.send-btn');
    
    const sendMessage = () => {
      const message = input.value.trim();
      
      if (message && this.game && this.game.network && this.game.network.socket) {
        console.log('Envoi du message à', player.id);
        
        // Envoyer via Socket.io
        this.game.network.socket.emit('privateMessage', {
          to: player.id,
          message: message
        });
        
        // Afficher localement
        this._addMessageToHistory(player.id, 'Vous', message, true);
        input.value = '';
      } else {
        console.error('Impossible d\'envoyer le message - connexion manquante');
        alert('Erreur: Connexion au serveur perdue');
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    input.focus();
  }

  // Ajouter un message à l'historique
  _addMessageToHistory(playerId, sender, message, isSent) {
    const history = document.getElementById('message-history-' + playerId);
    if (!history) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'message ' + (isSent ? 'sent' : 'received');
    msgEl.innerHTML = `
      <div class="message-sender">${sender}</div>
      <div class="message-text">${this._escapeHtml(message)}</div>
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    history.appendChild(msgEl);
    history.scrollTop = history.scrollHeight;
  }

  // Échapper HTML
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Ouvrir dialogue d'échange
  openTradeDialog(player) {
    console.log('Demande d\'échange avec', player.username);
    // TODO: implémenter le système d'échange
    alert('Système d\'échange en développement');
  }

  // Commencer à suivre un joueur
  startFollowing(player) {
    console.log('Suivre', player.username);
    // TODO: implémenter le système de suivi
    alert('Vous suivez maintenant ' + player.username);
  }

  // Envoyer un salut
  sendWave(player) {
    if (this.game.network) {
      this.game.network.socket.emit('emote', {
        to: player.id,
        type: 'wave'
      });
    }
    console.log('👋 Salut envoyé à', player.username);
  }

  // Recevoir un message privé
  receivePrivateMessage(data) {
    console.log('Message privé de', data.from, ':', data.message);
    
    // Trouver le joueur
    let player = null;
    this.game.network.otherPlayers.forEach((p, id) => {
      if (id === data.from) {
        player = { id: id, username: p.userData.username };
      }
    });

    if (player) {
      this._addMessageToHistory(player.id, player.username, data.message, false);
      
      // Notification si la fenêtre n'est pas ouverte
      const dialog = document.getElementById('message-dialog');
      if (!dialog) {
        this._showNotification(player.username + ' vous a envoyé un message');
      }
    }
  }

  // Afficher une notification
  _showNotification(text) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => { notif.remove(); }, 300);
    }, 3000);
  }
  }; // Fin de la classe InteractionManager

})(); // Fin de la fonction IIFE
