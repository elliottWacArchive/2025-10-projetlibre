// ChatManager - Gestion du chat public
(function() {
  'use strict';

  window.ChatManager = class ChatManager {
    constructor(socketClient) {
      this.socketClient = socketClient;
      this.chatDiv = null;
      this._createUI();
      this._setupCallbacks();
    }

    _createUI() {
      this.chatDiv = document.createElement('div');
      this.chatDiv.id = 'chat-messages';
      this.chatDiv.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 200px;
        max-width: 400px;
        max-height: 200px;
        overflow-y: auto;
        background: rgba(0,0,0,0.7);
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        color: white;
      `;
      document.body.appendChild(this.chatDiv);
    }

    _setupCallbacks() {
      if (!this.socketClient) return;
      
      this.socketClient.callbacks.onChatMessage = (data) => {
        this.displayMessage(data);
      };
    }

    displayMessage(data) {
      const msgEl = document.createElement('div');
      msgEl.style.marginBottom = '5px';
      msgEl.innerHTML = `<strong>${data.username}:</strong> ${this._escapeHtml(data.message)}`;
      this.chatDiv.appendChild(msgEl);
      
      this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
      
      while (this.chatDiv.children.length > 50) {
        this.chatDiv.removeChild(this.chatDiv.firstChild);
      }
    }

    sendMessage(message) {
      if (this.socketClient) {
        this.socketClient.sendChatMessage(message);
      }
    }

    _escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

})();
