// Classe principale du jeu - Mode global  
(function(){
  'use strict';

  console.log('🎯 Three.js version:', THREE.REVISION);
  console.log('🎯 Three.js WebGLRenderer:', THREE.WebGLRenderer);

  // Classe principale du jeu
  window.Game = class Game {
    constructor(container) {
      console.log('🎮 Initialisation de Game avec container:', container);
      this.container = container;
      this.width = container.clientWidth;
      this.height = container.clientHeight;

      this._init();
      this._bindEvents();
      this.animate();
    }

  _init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x20232a);

    // Camera: orthographic for isometric look
    const aspect = this.width / this.height;
    const d = 100;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);

    // Position camera for isometric projection
    this.camera.position.set(200, 200, 200);
    this.camera.lookAt(0, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(100, 200, 100);
    this.scene.add(directional);

    // Grid helper (ground)
    const grid = new THREE.GridHelper(200, 20, 0x444444, 0x2a2a2a);
    grid.rotation.x = Math.PI / 2;
    this.scene.add(grid);

    // Player (cube)
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({ color: 0x66ccff });
    this.player = new THREE.Mesh(geometry, material);
    this.player.position.set(0, 5, 0);
    this.scene.add(this.player);

    // Highlight tile under player
    const planeGeom = new THREE.PlaneGeometry(12, 12);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xffff66,
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.highlight = new THREE.Mesh(planeGeom, planeMat);
    this.highlight.rotation.x = -Math.PI / 2;
    this.highlight.position.set(0, 0.05, 0);
    this.scene.add(this.highlight);

    // Game state
    this.moveStep = 12;
    this.targetPos = null;
    this.moveLerp = 0.15;
    this.otherPlayers = new Map();

    // Joystick state
    this.joystick = {
      active: false,
      baseX: 0,
      baseY: 0,
      stickX: 0,
      stickY: 0,
      maxDistance: 35,
      moveThreshold: 10
    };

    // Initialize managers - ils seront chargés en global
    this.network = window.NetworkManager ? new window.NetworkManager(this) : null;
    this.interactions = window.InteractionManager ? new window.InteractionManager(this) : null;

    // Resize handler
    this.onWindowResize = () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      const aspect = this.width / this.height;
      const d = 100;
      this.camera.left = -d * aspect;
      this.camera.right = d * aspect;
      this.camera.top = d;
      this.camera.bottom = -d;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    };

    window.addEventListener('resize', this.onWindowResize);
  }

  _bindEvents() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      let dx = 0, dz = 0;
      
      if (key === 'arrowup' || key === 'w') dz = -this.moveStep;
      if (key === 'arrowdown' || key === 's') dz = this.moveStep;
      if (key === 'arrowleft' || key === 'a') dx = -this.moveStep;
      if (key === 'arrowright' || key === 'd') dx = this.moveStep;
      
      if (dx !== 0 || dz !== 0) {
        this.movePlayer(dx, dz);
      }
    });

    // Initialize virtual joystick
    this._initJoystick();
  }

  _initJoystick() {
    const joyContainer = document.getElementById('joystick-container');
    const joyBase = document.getElementById('joystick-base');
    const joyStick = document.getElementById('joystick-stick');
    
    if (!joyContainer || !joyBase || !joyStick) return;

    let moveInterval = null;

    const handleStart = (e) => {
      e.preventDefault();
      this.joystick.active = true;
      
      const rect = joyBase.getBoundingClientRect();
      this.joystick.baseX = rect.left + rect.width / 2;
      this.joystick.baseY = rect.top + rect.height / 2;

      if (moveInterval) clearInterval(moveInterval);
      moveInterval = setInterval(() => {
        this._updatePlayerFromJoystick();
      }, 150);
    };

    const handleMove = (e) => {
      if (!this.joystick.active) return;
      e.preventDefault();

      const touch = e.touches ? e.touches[0] : e;
      let deltaX = touch.clientX - this.joystick.baseX;
      let deltaY = touch.clientY - this.joystick.baseY;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > this.joystick.maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        deltaX = Math.cos(angle) * this.joystick.maxDistance;
        deltaY = Math.sin(angle) * this.joystick.maxDistance;
      }

      this.joystick.stickX = deltaX;
      this.joystick.stickY = deltaY;

      joyStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    };

    const handleEnd = (e) => {
      e.preventDefault();
      this.joystick.active = false;
      this.joystick.stickX = 0;
      this.joystick.stickY = 0;
      
      joyStick.style.transform = 'translate(-50%, -50%)';
      
      if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
      }
    };

    // Touch events
    joyBase.addEventListener('touchstart', handleStart, { passive: false });
    joyBase.addEventListener('touchmove', handleMove, { passive: false });
    joyBase.addEventListener('touchend', handleEnd, { passive: false });
    
    // Mouse events for desktop testing
    joyBase.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
  }

  _updatePlayerFromJoystick() {
    if (!this.joystick.active) return;
    
    const threshold = this.joystick.moveThreshold;
    if (Math.abs(this.joystick.stickX) <= threshold && Math.abs(this.joystick.stickY) <= threshold) {
      return;
    }

    let dx = 0, dz = 0;
    const angle = Math.atan2(this.joystick.stickY, this.joystick.stickX);
    const degrees = angle * (180 / Math.PI);
    
    // Convert to 8 directions
    if (degrees >= -22.5 && degrees < 22.5) dx = this.moveStep; // right
    else if (degrees >= 22.5 && degrees < 67.5) { dx = this.moveStep; dz = this.moveStep; } // down-right
    else if (degrees >= 67.5 && degrees < 112.5) dz = this.moveStep; // down
    else if (degrees >= 112.5 && degrees < 157.5) { dx = -this.moveStep; dz = this.moveStep; } // down-left
    else if (degrees >= 157.5 || degrees < -157.5) dx = -this.moveStep; // left
    else if (degrees >= -157.5 && degrees < -112.5) { dx = -this.moveStep; dz = -this.moveStep; } // up-left
    else if (degrees >= -112.5 && degrees < -67.5) dz = -this.moveStep; // up
    else if (degrees >= -67.5 && degrees < -22.5) { dx = this.moveStep; dz = -this.moveStep; } // up-right

    if (dx !== 0 || dz !== 0) {
      this.movePlayer(dx, dz);
    }
  }

  movePlayer(dx, dz) {
    const newX = Math.round(this.player.position.x) + dx;
    const newZ = Math.round(this.player.position.z) + dz;
    this.targetPos = new THREE.Vector3(newX, this.player.position.y, newZ);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smooth movement towards target
    if (this.targetPos) {
      this.player.position.lerp(this.targetPos, this.moveLerp);
      
      if (this.player.position.distanceToSquared(this.targetPos) < 0.01) {
        this.player.position.copy(this.targetPos);
        
        // Send position to server
        if (this.network) {
          this.network.sendPlayerPosition(
            this.player.position.x,
            this.player.position.y,
            this.player.position.z
          );
        }
        
        this.targetPos = null;
      }
      
      // Update highlight
      this.highlight.position.x = Math.round(this.player.position.x);
      this.highlight.position.z = Math.round(this.player.position.z);
    }

    // Update network and interactions
    if (this.network) this.network.update();
    if (this.interactions) this.interactions.update();

    this.renderer.render(this.scene, this.camera);
  }

  // Multiplayer methods
  addOtherPlayer(id, x, z, color) {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({ color: color || 0xff6666 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 5, z);
    this.scene.add(mesh);
    this.otherPlayers.set(id, mesh);
  }

  removeOtherPlayer(id) {
    const player = this.otherPlayers.get(id);
    if (player) {
      this.scene.remove(player);
      this.otherPlayers.delete(id);
    }
  }

  updateOtherPlayer(id, x, z) {
    const player = this.otherPlayers.get(id);
    if (player) {
      // Smooth interpolation for other players
      const targetPos = new THREE.Vector3(x, 5, z);
      player.position.lerp(targetPos, 0.1);
    }
  }

  // Clean-up
  destroy() {
    window.removeEventListener('resize', this.onWindowResize);
    // dispose renderer, geometries, materials if needed
  }
  }; // Fin de la classe Game

})(); // Fin de la fonction IIFE