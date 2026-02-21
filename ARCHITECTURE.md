# Architecture du Projet - Mini Jeu Isométrique 3D

## 📋 Récapitulatif des Composants Codés

### Client (Frontend)

| Fichier | Classe/Module | Responsabilité | Méthodes Principales |
|---------|---------------|----------------|----------------------|
| `game.js` | `Game` | Moteur principal du jeu | `_init()`, `animate()`, `movePlayer()`, `_initJoystick()` |
| `network.js` | `NetworkManager` | Gestion Socket.io & multiplayer | `sendPlayerPosition()`, `_addOtherPlayer()`, `update()` |
| `interaction.js` | `InteractionManager` | Interactions joueur-joueur | `openMenu()`, `handleInteraction()`, `openMessageDialog()` |
| `main.js` | IIFE | Point d'entrée, initialisation | `ready()`, détection tactile |

### Server (Backend)

| Fichier | Type | Responsabilité | Events Socket |
|---------|------|----------------|---------------|
| `server.js` | Express + Socket.io | API & temps réel | `playerMove`, `chatMessage`, `privateMessage`, `emote` |

---

## 🎮 Objets 3D (Three.js)

| Objet | Type | Description |
|-------|------|-------------|
| `player` | `BoxGeometry` (10x10x10) | Cube du joueur local |
| `otherPlayers` | `Map<id, Mesh>` | Cubes des autres joueurs |
| `highlight` | `PlaneGeometry` (12x12) | Tuile sous le joueur |
| `grid` | `GridHelper` (200x20) | Grille du sol |
| `playerLabel` | `Sprite` (canvas) | Nom au-dessus des joueurs |

---

## 🔌 Events Socket.io

### Client → Server
- `playerMove` : Position {x, y, z}
- `chatMessage` : Message texte
- `privateMessage` : {to, message}
- `emote` : {to, type}

### Server → Client
- `init` : Initialisation joueur
- `currentPlayers` : Liste joueurs
- `playerJoined` / `playerLeft` / `playerMoved`
- `chatMessage` / `privateMessage` / `emote`

---

## 📂 Structure Actuelle (Monolithique)

```
client/
├── src/
│   ├── game.js         # 301 lignes - TOUT le rendu + contrôles + joystick
│   ├── network.js      # 249 lignes - Réseau + UI connexion + chat
│   ├── interaction.js  # 351 lignes - Menu + dialogs + trade + follow
│   └── main.js         # 60 lignes - Bootstrap
└── styles/             # CSS séparés ✅

server/
└── server.js           # 149 lignes - TOUT le backend
```

---

## 🚀 Structure Proposée (Modulaire)

```
client/
├── src/
│   ├── core/                      # Noyau du jeu
│   │   ├── Game.js                # Orchestrateur principal (100 lignes max)
│   │   ├── Scene.js               # Setup Three.js (scene, camera, lights)
│   │   └── Renderer.js            # Rendu et boucle d'animation
│   │
│   ├── entities/                  # Objets du monde
│   │   ├── Player.js              # Joueur local (mesh, movement)
│   │   ├── OtherPlayer.js         # Autre joueur (mesh, label, interpolation)
│   │   └── Ground.js              # Sol, grille, highlight
│   │
│   ├── input/                     # Contrôles utilisateur
│   │   ├── KeyboardController.js  # WASD/Flèches
│   │   ├── JoystickController.js  # Tactile
│   │   └── InputManager.js        # Agrège les inputs
│   │
│   ├── network/                   # Communication
│   │   ├── SocketClient.js        # Connexion Socket.io pure
│   │   ├── PlayerSync.js          # Synchro des joueurs
│   │   └── ChatManager.js         # Messages chat/privés
│   │
│   ├── ui/                        # Interface utilisateur
│   │   ├── InteractionMenu.js     # Menu E
│   │   ├── MessageDialog.js       # Chat privé
│   │   ├── Notifications.js       # Toasts
│   │   └── ConnectionStatus.js    # Indicateur connexion
│   │
│   ├── systems/                   # Systèmes gameplay
│   │   ├── CollisionSystem.js     # Détection proximité
│   │   ├── TradeSystem.js         # Échanges (à implémenter)
│   │   └── FollowSystem.js        # Suivi joueur (à implémenter)
│   │
│   ├── utils/                     # Utilitaires
│   │   ├── math.js                # Helpers mathématiques
│   │   └── dom.js                 # Helpers DOM
│   │
│   └── main.js                    # Point d'entrée unique
│
├── assets/                        # Ressources statiques
│   ├── textures/
│   ├── sounds/
│   └── models/                    # Si 3D models plus tard
│
└── styles/                        # CSS (déjà bien organisé ✅)

server/
├── src/
│   ├── index.js                   # Point d'entrée
│   ├── config.js                  # Variables d'environnement
│   │
│   ├── socket/                    # Handlers Socket.io
│   │   ├── connection.js          # Connect/disconnect
│   │   ├── movement.js            # playerMove
│   │   ├── chat.js                # Messages publics/privés
│   │   └── emotes.js              # Émotes
│   │
│   ├── game/                      # Logique de jeu
│   │   ├── PlayerManager.js       # Gestion des joueurs (Map)
│   │   └── GameState.js           # État global
│   │
│   └── utils/
│       └── colors.js              # Génération couleurs
│
├── package.json
└── Dockerfile
```

---

## 🔧 Migration Progressive

### Phase 1 - Extraction Input (Facile)
Extraire `JoystickController.js` depuis `game.js` (~80 lignes)

### Phase 2 - Séparation UI
Extraire `InteractionMenu.js` et `MessageDialog.js` depuis `interaction.js`

### Phase 3 - Refactor Network
Séparer `SocketClient.js` (connexion pure) de `PlayerSync.js` (logique joueurs)

### Phase 4 - Modulariser Server
Créer les handlers séparés pour chaque type d'event

---

## 📊 Avantages de la Nouvelle Architecture

| Avant | Après |
|-------|-------|
| 4 gros fichiers | ~20 petits fichiers (~50-100 lignes) |
| Couplage fort | Modules indépendants |
| Difficile à tester | Testable unitairement |
| Un dev = conflits git | Travail en parallèle |
| Debug complexe | Isolation des bugs |

---

## 🎯 Priorités Recommandées

1. **Créer `input/JoystickController.js`** - Le plus isolé, facile à extraire
2. **Créer `entities/Player.js`** - Séparer le mesh du Game
3. **Créer `ui/InteractionMenu.js`** - Grosse partie de interaction.js
4. **Modulariser le serveur** - Handlers séparés pour scalabilité

---

## 📝 Convention de Nommage

- **Classes** : PascalCase (`PlayerManager`, `SocketClient`)
- **Fichiers** : PascalCase pour classes, camelCase pour utilitaires
- **Events** : camelCase (`playerMove`, `chatMessage`)
- **CSS classes** : kebab-case (`interaction-menu`)
