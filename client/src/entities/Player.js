// Player - Entité du joueur local
(function() {
  'use strict';

  window.Player = class Player {
    constructor(scene, color = 0x66ccff) {
      this.scene = scene;
      this.mesh = null;
      this.color = color;
      this.moveStep = 12;
      this.targetPos = null;
      this.moveLerp = 0.15;
      this._init();
    }

    _init() {
      const geometry = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshStandardMaterial({ color: this.color });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(0, 5, 0);
      this.scene.add(this.mesh);
    }

    setColor(hexColor) {
      this.color = hexColor;
      this.mesh.material.color.setHex(hexColor);
    }

    getPosition() {
      return this.mesh.position.clone();
    }

    setTargetPosition(x, z) {
      const newX = Math.round(this.mesh.position.x) + x;
      const newZ = Math.round(this.mesh.position.z) + z;
      this.targetPos = new THREE.Vector3(newX, this.mesh.position.y, newZ);
    }

    move(dx, dz) {
      this.setTargetPosition(dx, dz);
    }

    update() {
      if (!this.targetPos) return false;

      this.mesh.position.lerp(this.targetPos, this.moveLerp);
      
      if (this.mesh.position.distanceToSquared(this.targetPos) < 0.01) {
        this.mesh.position.copy(this.targetPos);
        const reachedTarget = this.targetPos.clone();
        this.targetPos = null;
        return reachedTarget; // Retourne la position atteinte
      }
      return false;
    }

    getMesh() {
      return this.mesh;
    }

    destroy() {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  };

})();
