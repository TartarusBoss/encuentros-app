# Stage 1: Construrir la aplicación Angular

# ===== Build stage (Usamos nodejs porque Angular se construye con Node) =====
FROM node:20-alpine AS build
# Directorio de trabajo
WORKDIR /app
# Copiamos los archivos de configuración de dependencias
COPY package*.json ./ package-lock.json ./

# Instalamos dependencias
RUN npm install

RUN npm ci --silent
# Copiamos el resto  de la aplicación
COPY . .

# build; si vamos a cambiar la configuración de salida, ajustar aquí, ajustar los flags
RUN npm run build --

# Stage 2: Servir la aplicación con Nginx

# ===== Entorno de ejecución: Nginx para los archivos estáticos (SPA) =====
FROM nginx:stable-alpine

# Copia los artefactos del build al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Comandos CMD para ejecutar Nginx en primer plano y garantizar que el frontend siga activo
CMD ["nginx", "-g", "daemon off;"]
