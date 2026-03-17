// InputManager - Agrège tous les contrôles
(function() {
  'use strict';

  window.InputManager = class InputManager {
    constructor(onMove) {
      this.onMove = onMove;
      this.keyboard = new window.KeyboardController(onMove);
      this.joystick = new window.JoystickController(onMove);
    }

    setMoveStep(step) {
      if (this.keyboard) this.keyboard.setMoveStep(step);
      if (this.joystick) this.joystick.setMoveStep(step);
    }
  };

})();
