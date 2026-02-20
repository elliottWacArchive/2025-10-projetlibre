# Jeu Isométrique 3D Multijoueur 🎮

Projet web de mini-jeu en 3D isométrique avec support multijoueur temps réel.

## 📁 Structure du Projet

```
web-game/
├── client/              # Frontend (Three.js + Socket.io client)
│   ├── src/
│   │   ├── game.js      # Logique du jeu Three.js
│   │   ├── network.js   # Gestion Socket.io et multijoueur
│   │   └── main.js      # Bootstrap
│   ├── index.html
│   ├── styles.css
│   ├── Dockerfile       # Image Nginx pour servir le frontend
│   └── nginx.conf
│
├── server/              # Backend (Node.js + Express + Socket.io)
│   ├── server.js        # Serveur principal
│   ├── package.json
│   └── Dockerfile       # Image Node.js pour le serveur
│
├── docker-compose.yml   # Orchestration des conteneurs
└── README.md
```

## 🚀 Démarrage Rapide avec Docker

### Prérequis
- Docker (>= 20.10)
- Docker Compose (>= 2.0)

### Lancer le projet complet

```bash
# Cloner/naviguer vers le projet
cd "le projet"

# Démarrer tous les conteneurs
./start 
docker compose up --build

# Ou en mode détaché (background)
docker compose up -d --build
```

**Accès:**
- 🎮 **Frontend:** http://localhost:8080
- 🔌 **Backend API:** http://localhost:3000
- 📊 **Health check:** http://localhost:3000/health

### Commandes Docker Utiles

```bash
# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend

# Arrêter les conteneurs
docker compose down

# Arrêter et supprimer les volumes
docker compose down -v

# Rebuild complet
docker compose build --no-cache

# Vérifier le statut
docker compose ps

# Redémarrer un service
docker compose restart backend
```

## 🛠️ Développement Local (sans Docker)

### Backend

```bash
cd server
npm install
npm start

# Ou avec nodemon pour le hot-reload
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

### Frontend

```bash
cd client
python3 -m http.server 8080
# Ou utilisez n'importe quel serveur HTTP statique
```

Le client est accessible sur **http://localhost:8080**

## 🎮 Fonctionnalités

### MVP Actuel
✅ Rendu 3D isométrique avec Three.js  
✅ Déplacement fluide avec clavier (WASD/Flèches)  
✅ Joystick virtuel tactile pour mobile/tablette  
✅ Connexion multijoueur temps réel (Socket.io)  
✅ Synchronisation des positions entre joueurs  
✅ Affichage des autres joueurs avec couleurs distinctes  
✅ Labels avec noms d'utilisateur  
✅ Chat basique  
✅ Architecture Docker backend + frontend  

### Contrôles
- **PC:** Touches fléchées ou WASD
- **Mobile/Tactile:** Joystick virtuel en bas à gauche
- **Chat:** (TODO: ajouter UI de saisie)

## 🏗️ Architecture Technique

### Stack
- **Frontend:**
  - Three.js (rendu 3D WebGL)
  - Socket.io-client (communication temps réel)
  - Vanilla JS (pas de framework)
  - Nginx (serveur statique)

- **Backend:**
  - Node.js 18
  - Express (API REST)
  - Socket.io (WebSocket temps réel)
  - CORS activé

- **Infrastructure:**
  - Docker & Docker Compose
  - Network bridge isolé
  - Healthchecks automatiques

### Communication
```
Client (Browser) ←→ Socket.io ←→ Server (Node.js)
     ↓                                    ↓
  Three.js Scene               Players State (Map)
  + NetworkManager             + Event Broadcasting
```

## 📡 Événements Socket.io

### Client → Serveur
- `playerMove` - Envoi de la nouvelle position
- `chatMessage` - Envoi d'un message chat

### Serveur → Client
- `init` - Initialisation du joueur (ID, couleur)
- `currentPlayers` - Liste de tous les joueurs actuels
- `playerJoined` - Notification nouveau joueur
- `playerMoved` - Un joueur a bougé
- `playerLeft` - Un joueur s'est déconnecté
- `chatMessage` - Message de chat reçu

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine (copier `.env.example`):

```bash
BACKEND_PORT=3000
FRONTEND_PORT=8080
CLIENT_URL=http://localhost:8080
NODE_ENV=production
```

### Ports utilisés
- **3000** - Backend (Socket.io + API)
- **8080** - Frontend (Nginx)

## 🚢 Déploiement

### Build des images

```bash
# Backend
docker build -t isometric-game-backend:latest ./server

# Frontend
docker build -t isometric-game-frontend:latest ./client
```

### Push vers un registry (exemple Docker Hub)

```bash
docker tag isometric-game-backend:latest username/isometric-game-backend:latest
docker push username/isometric-game-backend:latest

docker tag isometric-game-frontend:latest username/isometric-game-frontend:latest
docker push username/isometric-game-frontend:latest
```

### Déploiement sur serveur

```bash
# Sur le serveur de production
git clone <repo>
cd web-game

# Ajuster les variables dans .env (notamment CLIENT_URL avec l'IP publique)
cp .env.example .env
nano .env

# Lancer en production
docker-compose up -d --build
```

## 📋 TODO / Améliorations Futures

### Priorités MVP
- [ ] Interface de chat complète (input + historique)
- [ ] Authentification utilisateur (login/register)
- [ ] Salles/rooms thématiques
- [ ] Limites de la grille + collisions
- [ ] Animation de marche

### Avancées
- [ ] Base de données pour persistence
- [ ] Système de rooms/lobbies
- [ ] Interactions entre joueurs (émotes, bulles)
- [ ] Textures et assets pixelisés
- [ ] Zone Focus qui suit le joueur, pour limiter effet profondeur
- [ ] Minimap
- [ ] Effets sonores
- [ ] Tests unitaires (Jest)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (Prometheus + Grafana)

## 🐛 Debug

### Vérifier que les conteneurs tournent
```bash
docker-compose ps
```

### Inspecter les logs
```bash
# Tous les logs
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### Tester la connexion Socket.io manuellement

Ouvrir la console du navigateur (F12) et tester:

```javascript
// Vérifier que Socket.io est chargé
console.log(io);

// Voir l'état de connexion
console.log(game.network.socket.connected);

// Voir les autres joueurs
console.log(game.network.otherPlayers);
```

### Problèmes courants

**❌ Erreur CORS**
- Vérifier que `CLIENT_URL` dans `.env` correspond à l'URL du frontend
- Vérifier que le backend autorise bien l'origine dans `server.js`

**❌ Socket.io ne se connecte pas**
- Vérifier que le port 3000 est bien ouvert
- Vérifier que le backend est démarré: `docker-compose logs backend`
- Vérifier l'URL dans `client/index.html` (variable `SOCKET_SERVER_URL`)

**❌ Frontend ne charge pas**
- Vérifier que Nginx tourne: `docker-compose ps frontend`
- Vérifier les logs Nginx: `docker-compose logs frontend`

## 📝 Licence

Code fourni en exemple. Libre d'usage pour prototypage et apprentissage.

## 👥 Contributeurs

Projet réalisé dans le cadre du cours Epitech W@C WebAcadémie 2025/2026 - Projet Libre.

---

**Bon jeu ! 🎮**
