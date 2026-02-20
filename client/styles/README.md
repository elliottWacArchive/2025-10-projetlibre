# Architecture CSS - Jeu Isométrique 3D

Organisation modulaire des feuilles de style pour une meilleure maintenabilité.

## 📁 Structure

```
client/
├── styles.css              # Point d'entrée principal (imports)
└── styles/
    ├── base.css           # Reset et styles de base
    ├── ui.css             # Interface utilisateur (hints, status)
    ├── joystick.css       # Contrôles tactiles
    ├── interactions.css   # Menu d'interactions et proximité
    ├── messaging.css      # Dialogue de messagerie instantanée
    └── components.css     # Composants réutilisables (boutons, scrollbar, notifications)
```

## 📄 Description des modules

### `base.css`
- Reset CSS (`* { box-sizing: border-box }`)
- Styles de base pour `html`, `body`, `#container`
- Classes utilitaires (`.hidden`, `.show`)

### `ui.css`
- Élément `.hint` (instructions en haut à gauche)
- `#connection-status` (statut de connexion)
- `#chat-messages` (chat global)

### `joystick.css`
- Joystick virtuel pour écrans tactiles
- `#joystick-container`, `#joystick-base`, `#joystick-stick`
- Media queries pour détection tactile
- Classe `.touch-enabled`

### `interactions.css`
- `.interaction-indicator` (indicateur "Appuyez sur E")
- `.interaction-menu` (menu latéral gauche)
- `.player-interaction-section` (sections par joueur)
- `.interaction-option` (boutons d'action)
- Animation `slideInLeft` et `pulse`

### `messaging.css`
- `.message-dialog` (fenêtre de chat privé)
- `.message-history` (historique des messages)
- `.message.sent` / `.message.received`
- `.message-input-container`
- Animation `slideInRight` et `messageSlide`

### `components.css`
- `.close-btn` (bouton de fermeture réutilisable)
- `.notification` (notifications toast)
- Scrollbar personnalisée pour tous les containers

## 🎨 Variables CSS (à venir)

Pour une personnalisation facile, vous pourrez ajouter un fichier `variables.css`:

```css
:root {
  --color-primary: #66ccff;
  --color-secondary: #667eea;
  --color-bg-dark: rgba(20, 25, 35, 0.95);
  --color-border: rgba(102, 204, 255, 0.5);
  --radius-small: 6px;
  --radius-medium: 8px;
  --radius-large: 12px;
  --shadow-light: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-heavy: 0 8px 24px rgba(0,0,0,0.6);
}
```

## 🔧 Utilisation

Le fichier principal `styles.css` importe tous les modules via `@import`.

**Dans `index.html`:**
```html
<link rel="stylesheet" href="styles.css">
```

## 📝 Conventions

- **BEM** pour les classes imbriquées (ex: `.message-dialog-header`)
- **Animations** préfixées par leur fonction (ex: `slideInLeft`, `pulse`)
- **Z-index layers**:
  - 10: UI de base (hint, status)
  - 50: Chat global
  - 100: Joystick et indicateurs
  - 1000: Menu d'interactions
  - 1001: Dialogues (messagerie)
  - 2000: Notifications

## ✨ Améliorations futures

- [ ] Variables CSS pour thèmes
- [ ] Mode sombre/clair
- [ ] Responsive mobile amélioré
- [ ] Animations personnalisables
- [ ] Support RTL
