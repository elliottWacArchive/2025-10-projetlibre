# Frontend Dockerfile - Nginx pour fichiers statiques
FROM nginx:alpine

# Métadonnées
LABEL maintainer="epitech-team"
LABEL description="Frontend client pour jeu isométrique 3D"

# Copier les fichiers statiques
COPY . /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
