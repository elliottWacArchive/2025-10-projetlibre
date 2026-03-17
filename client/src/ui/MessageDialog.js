// MessageDialog - Fenêtre de messagerie privée
(function() {
  'use strict';

  window.MessageDialog = class MessageDialog {
    constructor(socketClient) {
      this.socketClient = socketClient;
      this.dialogs = new Map(); // Map<playerId, dialogElement>
      this._setupCallbacks();
    }

    _setupCallbacks() {
      if (!this.socketClient) return;
      
      this.socketClient.callbacks.onPrivateMessage = (data) => {
        this.receiveMessage(data);
      };
    }

    open(player) {
      if (this.dialogs.has(player.id)) {
        this.dialogs.get(player.id).focus();
        return;
      }

      const dialog = document.createElement('div');
      dialog.id = 'message-dialog-' + player.id;
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
      this.dialogs.set(player.id, dialog);

      // Fermer
      dialog.querySelector('.close-btn').addEventListener('click', () => {
        this.close(player.id);
      });

      // Envoyer message
      const input = dialog.querySelector('.message-input');
      const sendBtn = dialog.querySelector('.send-btn');
      
      const sendMessage = () => {
        const message = input.value.trim();
        if (message && this.socketClient) {
          this.socketClient.sendPrivateMessage(player.id, message);
          this._addMessage(player.id, 'Vous', message, true);
          input.value = '';
        }
      };

      sendBtn.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });

      input.focus();
    }

    close(playerId) {
      const dialog = this.dialogs.get(playerId);
      if (dialog) {
        dialog.remove();
        this.dialogs.delete(playerId);
      }
    }

    receiveMessage(data) {
      // Ouvrir le dialog si pas encore ouvert
      if (!this.dialogs.has(data.from)) {
        // Notifier l'utilisateur
        if (window.notifications) {
          window.notifications.info(`${data.fromUsername} vous a envoyé un message`);
        }
      }
      
      this._addMessage(data.from, data.fromUsername, data.message, false);
    }

    _addMessage(playerId, sender, message, isSent) {
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

    _escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

})();
