// Scene - Gestion de la scène Three.js
(function() {
  'use strict';

  window.SceneManager = class SceneManager {
    constructor() {
      this.scene = null;
      this.camera = null;
      this.lights = [];
      this._init();
    }

    _init() {
      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x20232a);
    }

    setupCamera(width, height) {
      const aspect = width / height;
      const d = 100;
      this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
      this.camera.position.set(200, 200, 200);
      this.camera.lookAt(0, 0, 0);
      return this.camera;
    }

    updateCamera(width, height) {
      if (!this.camera) return;
      const aspect = width / height;
      const d = 100;
      this.camera.left = -d * aspect;
      this.camera.right = d * aspect;
      this.camera.top = d;
      this.camera.bottom = -d;
      this.camera.updateProjectionMatrix();
    }

    setupLights() {
      // Ambient light
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambient);
      this.lights.push(ambient);

      // Directional light
      const directional = new THREE.DirectionalLight(0xffffff, 0.6);
      directional.position.set(100, 200, 100);
      this.scene.add(directional);
      this.lights.push(directional);

      return this.lights;
    }

    add(object) {
      this.scene.add(object);
    }

    remove(object) {
      this.scene.remove(object);
    }

    getScene() {
      return this.scene;
    }

    getCamera() {
      return this.camera;
    }
  };

})();
