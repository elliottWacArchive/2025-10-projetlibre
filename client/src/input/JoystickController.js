// JoystickController - Gestion du joystick tactile
(function() {
  'use strict';

  window.JoystickController = class JoystickController {
    constructor(onMove) {
      this.onMove = onMove;
      this.moveStep = 12;
      this.active = false;
      this.baseX = 0;
      this.baseY = 0;
      this.stickX = 0;
      this.stickY = 0;
      this.maxDistance = 35;
      this.moveThreshold = 10;
      this.moveInterval = null;
      
      this.joyContainer = document.getElementById('joystick-container');
      this.joyBase = document.getElementById('joystick-base');
      this.joyStick = document.getElementById('joystick-stick');
      
      if (this.joyBase && this.joyStick) {
        this._bindEvents();
      }
    }

    _bindEvents() {
      const handleStart = (e) => {
        e.preventDefault();
        this.active = true;
        
        const rect = this.joyBase.getBoundingClientRect();
        this.baseX = rect.left + rect.width / 2;
        this.baseY = rect.top + rect.height / 2;

        if (this.moveInterval) clearInterval(this.moveInterval);
        this.moveInterval = setInterval(() => {
          this._updateMovement();
        }, 150);
      };

      const handleMove = (e) => {
        if (!this.active) return;
        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        let deltaX = touch.clientX - this.baseX;
        let deltaY = touch.clientY - this.baseY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > this.maxDistance) {
          const angle = Math.atan2(deltaY, deltaX);
          deltaX = Math.cos(angle) * this.maxDistance;
          deltaY = Math.sin(angle) * this.maxDistance;
        }

        this.stickX = deltaX;
        this.stickY = deltaY;

        this.joyStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
      };

      const handleEnd = (e) => {
        e.preventDefault();
        this.active = false;
        this.stickX = 0;
        this.stickY = 0;
        
        this.joyStick.style.transform = 'translate(-50%, -50%)';
        
        if (this.moveInterval) {
          clearInterval(this.moveInterval);
          this.moveInterval = null;
        }
      };

      // Touch events
      this.joyBase.addEventListener('touchstart', handleStart, { passive: false });
      this.joyBase.addEventListener('touchmove', handleMove, { passive: false });
      this.joyBase.addEventListener('touchend', handleEnd, { passive: false });
      
      // Mouse events for desktop testing
      this.joyBase.addEventListener('mousedown', handleStart);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }

    _updateMovement() {
      if (!this.active) return;
      
      if (Math.abs(this.stickX) <= this.moveThreshold && Math.abs(this.stickY) <= this.moveThreshold) {
        return;
      }

      let dx = 0, dz = 0;
      const angle = Math.atan2(this.stickY, this.stickX);
      const degrees = angle * (180 / Math.PI);
      
      // Convert to 8 directions
      if (degrees >= -22.5 && degrees < 22.5) dx = this.moveStep;
      else if (degrees >= 22.5 && degrees < 67.5) { dx = this.moveStep; dz = this.moveStep; }
      else if (degrees >= 67.5 && degrees < 112.5) dz = this.moveStep;
      else if (degrees >= 112.5 && degrees < 157.5) { dx = -this.moveStep; dz = this.moveStep; }
      else if (degrees >= 157.5 || degrees < -157.5) dx = -this.moveStep;
      else if (degrees >= -157.5 && degrees < -112.5) { dx = -this.moveStep; dz = -this.moveStep; }
      else if (degrees >= -112.5 && degrees < -67.5) dz = -this.moveStep;
      else if (degrees >= -67.5 && degrees < -22.5) { dx = this.moveStep; dz = -this.moveStep; }

      if (dx !== 0 || dz !== 0) {
        if (this.onMove) this.onMove(dx, dz);
      }
    }

    setMoveStep(step) {
      this.moveStep = step;
    }

    isActive() {
      return this.active;
    }
  };

})();
