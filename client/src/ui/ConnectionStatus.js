// ConnectionStatus - Indicateur de connexion
(function() {
  'use strict';

  window.ConnectionStatus = class ConnectionStatus {
    constructor(socketClient) {
      this.socketClient = socketClient;
      this.statusDiv = null;
      this._createUI();
      this._setupCallbacks();
    }

    _createUI() {
      this.statusDiv = document.createElement('div');
      this.statusDiv.id = 'connection-status';
      this.statusDiv.style.cssText = `
        position: absolute;
        top: 50px;
        left: 16px;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        color: white;
      `;
      document.body.appendChild(this.statusDiv);
      this.setConnected(false);
    }

    _setupCallbacks() {
      if (!this.socketClient) return;
      
      this.socketClient.callbacks.onConnect = () => this.setConnected(true);
      this.socketClient.callbacks.onDisconnect = () => this.setConnected(false);
      this.socketClient.callbacks.onError = () => this.setConnected(false);
    }

    setConnected(connected) {
      if (connected) {
        this.statusDiv.textContent = '🟢 Connecté';
        this.statusDiv.style.background = 'rgba(0,200,0,0.3)';
      } else {
        this.statusDiv.textContent = '🔴 Déconnecté';
        this.statusDiv.style.background = 'rgba(200,0,0,0.3)';
      }
    }
  };

})();
