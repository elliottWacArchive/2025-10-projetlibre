// Main - Mode compatible global
(function(){
  'use strict';

  console.log('🎮 Main.js chargé, mode global actif');
  console.log('🔧 Vérification des dépendances:');
  console.log('   - THREE:', typeof THREE !== 'undefined' ? '✅' : '❌');
  console.log('   - io:', typeof io !== 'undefined' ? '✅' : '❌');
  console.log('   - Game:', typeof Game !== 'undefined' ? '✅' : '❌');

  // Attendre que le DOM soit prêt
  function ready(fn){
    if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){
    console.log('📱 DOM prêt, vérification des classes...');
    console.log('   - Game disponible:', typeof Game !== 'undefined' ? '✅' : '❌');
    
    if (typeof Game === 'undefined') {
      console.error('❌ Game n\'est pas défini ! Vérifiez que game.js est chargé avant main.js');
      return;
    }
    
    var container = document.getElementById('container');

    if (!container) {
      console.error('❌ Container #container non trouvé !');
      return;
    }

  // Petit hint UI
  var hint = document.createElement('div');
  hint.className = 'hint';
  hint.innerHTML = 'Flèches / WASD pour déplacer<br>Joystick tactile sur mobile';
  document.body.appendChild(hint);

  // Détection tactile et activation du joystick
  var joyContainer = document.getElementById('joystick-container');
  
  // Vérifier si l'appareil supporte le touch
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  
  if(isTouchDevice && joyContainer){
    joyContainer.classList.add('touch-enabled');
  }
  
  // Détecter le premier événement touch pour les appareils hybrides
  var touchDetected = false;
  window.addEventListener('touchstart', function enableJoystick(){
    if(!touchDetected && joyContainer){
      touchDetected = true;
      joyContainer.classList.add('touch-enabled');
    }
  }, { once: true, passive: true });

  // Crée le jeu
  console.log('🚀 Création de la classe Game...');
  try {
    window.game = new Game(container);
    console.log('✅ Jeu initialisé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du jeu:', error);
  }
  });

})(); // Fin de la fonction IIFE
