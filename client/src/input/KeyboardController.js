// KeyboardController - Gestion des entrées clavier
(function() {
  'use strict';

  window.KeyboardController = class KeyboardController {
    constructor(onMove) {
      this.onMove = onMove;
      this.moveStep = 12;
      this._bindEvents();
    }

    _bindEvents() {
      window.addEventListener('keydown', (e) => this._handleKeyDown(e));
    }

    _handleKeyDown(e) {
      const key = e.key.toLowerCase();
      let dx = 0, dz = 0;
      
      if (key === 'arrowup' || key === 'w' || key === 'z') dz = -this.moveStep;
      if (key === 'arrowdown' || key === 's') dz = this.moveStep;
      if (key === 'arrowleft' || key === 'a' || key === 'q') dx = -this.moveStep;
      if (key === 'arrowright' || key === 'd') dx = this.moveStep;
      
      if (dx !== 0 || dz !== 0) {
        if (this.onMove) this.onMove(dx, dz);
      }
    }

    setMoveStep(step) {
      this.moveStep = step;
    }
  };

})();
