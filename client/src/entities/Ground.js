// Ground - Sol et grille du jeu
(function() {
  'use strict';

  window.Ground = class Ground {
    constructor(scene) {
      this.scene = scene;
      this.grid = null;
      this.highlight = null;
      this._init();
    }

    _init() {
      // Grid helper (ground)
      this.grid = new THREE.GridHelper(200, 20, 0x444444, 0x2a2a2a);
      this.grid.rotation.x = Math.PI / 2;
      this.scene.add(this.grid);

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
    }

    updateHighlight(x, z) {
      this.highlight.position.x = Math.round(x);
      this.highlight.position.z = Math.round(z);
    }

    destroy() {
      this.scene.remove(this.grid);
      this.scene.remove(this.highlight);
      this.highlight.geometry.dispose();
      this.highlight.material.dispose();
    }
  };

})();
