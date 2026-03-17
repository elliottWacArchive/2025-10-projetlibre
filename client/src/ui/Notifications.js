// Notifications - Système de notifications toast
(function() {
  'use strict';

  window.Notifications = class Notifications {
    constructor() {
      this.container = null;
      this._createContainer();
    }

    _createContainer() {
      this.container = document.createElement('div');
      this.container.id = 'notifications-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    }

    show(text, type = 'info', duration = 3000) {
      const notif = document.createElement('div');
      notif.className = 'notification notification-' + type;
      notif.style.cssText = `
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        ${this._getTypeStyles(type)}
      `;
      notif.textContent = text;
      this.container.appendChild(notif);
      
      requestAnimationFrame(() => {
        notif.style.opacity = '1';
        notif.style.transform = 'translateX(0)';
      });
      
      setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100px)';
        setTimeout(() => notif.remove(), 300);
      }, duration);
    }

    _getTypeStyles(type) {
      switch(type) {
        case 'success': return 'background: rgba(0, 200, 0, 0.9);';
        case 'error': return 'background: rgba(200, 0, 0, 0.9);';
        case 'warning': return 'background: rgba(200, 150, 0, 0.9);';
        default: return 'background: rgba(0, 100, 200, 0.9);';
      }
    }

    info(text) { this.show(text, 'info'); }
    success(text) { this.show(text, 'success'); }
    error(text) { this.show(text, 'error'); }
    warning(text) { this.show(text, 'warning'); }
  };

})();
