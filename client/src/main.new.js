// Main - Point d'entrée (Version modulaire)
(function() {
  'use strict';

  console.log('🎮 Main.js chargé, mode modulaire actif');
  console.log('🔧 Vérification des dépendances:');
  console.log('   - THREE:', typeof THREE !== 'undefined' ? '✅' : '❌');
  console.log('   - io:', typeof io !== 'undefined' ? '✅' : '❌');

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function() {
    console.log('📱 DOM prêt, vérification des modules...');
    
    // Vérifier les modules requis
    const modules = [
      'RenderManager', 'SceneManager', 'Player', 'OtherPlayer', 'Ground',
      'KeyboardController', 'JoystickController', 'InputManager',
      'SocketClient', 'PlayerSync', 'ChatManager',
      'ConnectionStatus', 'Notifications', 'MessageDialog', 'InteractionMenu',
      'Game'
    ];
    
    let allLoaded = true;
    modules.forEach(m => {
      const loaded = typeof window[m] !== 'undefined';
      console.log(`   - ${m}: ${loaded ? '✅' : '❌'}`);
      if (!loaded) allLoaded = false;
    });

    if (!allLoaded) {
      console.error('❌ Certains modules ne sont pas chargés !');
      return;
    }

    const container = document.getElementById('container');
    if (!container) {
      console.error('❌ Container #container non trouvé !');
      return;
    }

    // Hint UI
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.innerHTML = 'Flèches / WASD pour déplacer<br>E pour interagir<br>Joystick tactile sur mobile';
    document.body.appendChild(hint);

    // Détection tactile
    const joyContainer = document.getElementById('joystick-container');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (isTouchDevice && joyContainer) {
      joyContainer.classList.add('touch-enabled');
    }
    
    window.addEventListener('touchstart', function enableJoystick() {
      if (joyContainer) joyContainer.classList.add('touch-enabled');
    }, { once: true, passive: true });

    // Créer le jeu
    console.log('🚀 Création du jeu...');
    try {
      window.game = new Game(container);
      console.log('✅ Jeu initialisé avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  });

})();
