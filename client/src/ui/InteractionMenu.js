// InteractionMenu - Menu d'interactions joueur
(function() {
  'use strict';

  window.InteractionMenu = class InteractionMenu {
    constructor(game) {
      this.game = game;
      this.menu = null;
      this.indicator = null;
      this.isOpen = false;
      this.nearbyPlayers = [];
      this.interactionRadius = 50;
      
      this._createUI();
      this._bindEvents();
    }

    _createUI() {
      // Menu d'interactions
      this.menu = document.createElement('div');
      this.menu.id = 'interaction-menu';
      this.menu.className = 'interaction-menu hidden';
      this.menu.innerHTML = `
        <div class="interaction-menu-header">
          <h3>Interactions disponibles</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="interaction-menu-content"></div>
      `;
      document.body.appendChild(this.menu);

      // Indicateur
      this.indicator = document.createElement('div');
      this.indicator.id = 'interaction-indicator';
      this.indicator.className = 'interaction-indicator hidden';
      this.indicator.innerHTML = '<span class="indicator-text">Appuyez sur E pour interagir</span>';
      document.body.appendChild(this.indicator);
    }

    _bindEvents() {
      // Fermer le menu
      this.menu.querySelector('.close-btn').addEventListener('click', () => {
        this.close();
      });

      // Touche E pour ouvrir
      window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'e' && !this.isOpen) {
          if (this.nearbyPlayers.length > 0) {
            this.open();
          }
        } else if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Clic sur une option
      this.menu.addEventListener('click', (e) => {
        if (e.target.classList.contains('interaction-option')) {
          const action = e.target.dataset.action;
          const playerId = e.target.dataset.playerId;
          this._handleInteraction(action, playerId);
        }
      });
    }

    update() {
      if (!this.game.playerSync || !this.game.player) return;

      const playerPos = this.game.player.getPosition();
      this.nearbyPlayers = this.game.playerSync.getPlayersNear(playerPos, this.interactionRadius);
      this._updateIndicator();
    }

    _updateIndicator() {
      if (this.nearbyPlayers.length > 0 && !this.isOpen) {
        this.indicator.classList.remove('hidden');
        const count = this.nearbyPlayers.length;
        const text = count === 1 
          ? 'Appuyez sur E pour interagir avec ' + this.nearbyPlayers[0].username
          : `Appuyez sur E pour interagir (${count} joueurs)`;
        this.indicator.querySelector('.indicator-text').textContent = text;
      } else {
        this.indicator.classList.add('hidden');
      }
    }

    open() {
      if (this.nearbyPlayers.length === 0) return;

      this.isOpen = true;
      const content = this.menu.querySelector('.interaction-menu-content');
      content.innerHTML = '';

      this.nearbyPlayers.forEach((p) => {
        const section = document.createElement('div');
        section.className = 'player-interaction-section';
        section.innerHTML = `
          <div class="player-header">
            <strong>${p.username}</strong>
            <span class="distance">${Math.round(p.distance)} unités</span>
          </div>
          ${this._generateOptions(p)}
        `;
        content.appendChild(section);
      });

      this.menu.classList.remove('hidden');
      this.indicator.classList.add('hidden');
    }

    _generateOptions(player) {
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

    close() {
      this.isOpen = false;
      this.menu.classList.add('hidden');
      this._updateIndicator();
    }

    _handleInteraction(action, playerId) {
      const playerInfo = this.nearbyPlayers.find(p => p.id === playerId);
      if (!playerInfo) return;

      console.log('Interaction:', action, 'avec', playerInfo.username);

      switch (action) {
        case 'message':
          if (this.game.messageDialog) {
            this.game.messageDialog.open({ id: playerId, username: playerInfo.username });
          }
          break;
        case 'trade':
          if (window.notifications) window.notifications.info('Système d\'échange en développement');
          break;
        case 'follow':
          if (window.notifications) window.notifications.info('Vous suivez ' + playerInfo.username);
          break;
        case 'wave':
          if (this.game.socketClient) {
            this.game.socketClient.sendEmote(playerId, 'wave');
          }
          if (window.notifications) window.notifications.success('👋 Salut envoyé!');
          break;
      }

      this.close();
    }
  };

})();
