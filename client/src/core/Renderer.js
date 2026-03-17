// Renderer - Gestion du rendu WebGL
(function() {
  'use strict';

  window.RenderManager = class RenderManager {
    constructor(container) {
      this.container = container;
      this.renderer = null;
      this.width = container.clientWidth;
      this.height = container.clientHeight;
      this._init();
    }

    _init() {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(window.devicePixelRatio || 1);
      this.container.appendChild(this.renderer.domElement);
    }

    resize() {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.renderer.setSize(this.width, this.height);
    }

    render(scene, camera) {
      this.renderer.render(scene, camera);
    }

    getWidth() {
      return this.width;
    }

    getHeight() {
      return this.height;
    }

    getDomElement() {
      return this.renderer.domElement;
    }

    dispose() {
      this.renderer.dispose();
    }
  };

})();
