// OtherPlayer - Entité des autres joueurs
(function() {
  'use strict';

  window.OtherPlayer = class OtherPlayer {
    constructor(scene, playerData) {
      this.scene = scene;
      this.id = playerData.id;
      this.username = playerData.username;
      this.mesh = null;
      this.label = null;
      this.targetPos = null;
      this._init(playerData);
    }

    _init(playerData) {
      const geometry = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshStandardMaterial({ color: playerData.color || 0xff6b6b });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(playerData.x, playerData.y, playerData.z);
      this.mesh.userData.playerId = this.id;
      this.mesh.userData.username = this.username;
      this.scene.add(this.mesh);
      
      this._createLabel();
    }

    _createLabel() {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      
      context.fillStyle = 'rgba(0, 0, 0, 0.6)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.font = 'Bold 24px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(this.username, 128, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      this.label = new THREE.Sprite(spriteMaterial);
      this.label.scale.set(20, 5, 1);
      this.label.position.y = 15;
      
      this.mesh.add(this.label);
    }

    setTargetPosition(x, y, z) {
      this.targetPos = new THREE.Vector3(x, y, z);
    }

    update() {
      if (!this.targetPos) return;
      
      this.mesh.position.lerp(this.targetPos, 0.15);
      
      if (this.mesh.position.distanceToSquared(this.targetPos) < 0.01) {
        this.mesh.position.copy(this.targetPos);
        this.targetPos = null;
      }
    }

    getPosition() {
      return this.mesh.position.clone();
    }

    getMesh() {
      return this.mesh;
    }

    destroy() {
      if (this.label) {
        this.mesh.remove(this.label);
        this.label.material.map.dispose();
        this.label.material.dispose();
      }
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  };

})();
