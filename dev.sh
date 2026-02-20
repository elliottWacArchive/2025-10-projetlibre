#!/bin/bash
# Script de développement local (sans Docker)

echo "🛠️  Mode développement local"
echo ""

# Fonction pour cleanup
cleanup() {
    echo ""
    echo "🛑 Arrêt des processus..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Démarrer le backend
echo "▶️  Démarrage du backend (port 3000)..."
cd server
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    npm install
fi
npm start &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 2

# Démarrer le frontend
echo "▶️  Démarrage du frontend (port 8080)..."
cd client
python3 -m http.server 8080 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Serveurs démarrés!"
echo ""
echo "📍 Accès:"
echo "   - Frontend: http://localhost:8080"
echo "   - Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Attendre
wait
