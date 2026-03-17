// Utilitaire: génération de couleurs aléatoires
const PLAYER_COLORS = [
  0x66ccff, // bleu clair
  0xff6b6b, // rouge
  0x4ecdc4, // cyan
  0xffe66d, // jaune
  0x95e1d3, // vert menthe
  0xf38181, // rose
  0xaa96da, // violet
  0xfcbad3  // rose clair
];

function getRandomColor() {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

function generateUsername() {
  return `Player_${Math.floor(Math.random() * 1000)}`;
}

module.exports = {
  PLAYER_COLORS,
  getRandomColor,
  generateUsername
};
