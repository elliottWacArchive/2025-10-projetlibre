// Game - Orchestrateur principal (Version modulaire)
(function() {
  'use strict';

  console.log('🎯 Three.js version:', THREE.REVISION);

  window.Game = class Game {
    constructor(container) {
      console.log('🎮 Initialisation de Game avec container:', container);
      this.container = container;
      
      // Managers
      this.sceneManager = null;
      this.renderManager = null;
      this.inputManager = null;
      this.socketClient = null;
      this.playerSync = null;
      this.chatManager = null;
      this.connectionStatus = null;
      this.messageDialog = null;
      this.interactionMenu = null;
      
      // Entities
      this.player = null;
      this.ground = null;

      this._init();
      this._bindEvents();
      this.animate();
    }

    _init() {
      // Core
      this.renderManager = new window.RenderManager(this.container);
      this.sceneManager = new window.SceneManager();
      this.sceneManager.setupCamera(this.renderManager.getWidth(), this.renderManager.getHeight());
      this.sceneManager.setupLights();

      // Entities
      this.ground = new window.Ground(this.sceneManager.getScene());
      this.player = new window.Player(this.sceneManager.getScene());

      // Input
      this.inputManager = new window.InputManager((dx, dz) => {
        this.player.move(dx, dz);
      });

      // Network
      this.socketClient = new window.SocketClient(window.SOCKET_SERVER_URL, {
        onInit: (data) => {
          if (data.player && data.player.color) {
            this.player.setColor(data.player.color);
          }
        }
      });

      this.playerSync = new window.PlayerSync(this.sceneManager.getScene(), this.socketClient);
      this.chatManager = new window.ChatManager(this.socketClient);

      // UI
      window.notifications = new window.Notifications();
      this.connectionStatus = new window.ConnectionStatus(this.socketClient);
      this.messageDialog = new window.MessageDialog(this.socketClient);
      this.interactionMenu = new window.InteractionMenu(this);

      console.log('✅ Tous les modules initialisés');
    }

    _bindEvents() {
      // Resize handler
      window.addEventListener('resize', () => {
        this.renderManager.resize();
        this.sceneManager.updateCamera(
          this.renderManager.getWidth(),
          this.renderManager.getHeight()
        );
      });
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      // Update player
      const reached = this.player.update();
      if (reached && this.socketClient) {
        this.socketClient.sendPosition(reached.x, reached.y, reached.z);
      }

      // Update ground highlight
      const playerPos = this.player.getPosition();
      this.ground.updateHighlight(playerPos.x, playerPos.z);

      // Update network
      if (this.playerSync) this.playerSync.update();

      // Update interactions
      if (this.interactionMenu) this.interactionMenu.update();

      // Render
      this.renderManager.render(
        this.sceneManager.getScene(),
        this.sceneManager.getCamera()
      );
    }

    destroy() {
      if (this.player) this.player.destroy();
      if (this.ground) this.ground.destroy();
      if (this.renderManager) this.renderManager.dispose();
    }
  };

})();
