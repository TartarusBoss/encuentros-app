# Encuentros Front

Frontend en Angular para la app de encuentros. Se conecta con el backend en `http://localhost:3000` y usa la recomendación con IA local vía Ollama.

## Requisitos

- Node.js LTS 20+
- npm
- Angular CLI (se instala con `npm install` en este proyecto)
- Backend corriendo en `localhost:3000`
- Ollama corriendo en `localhost:11434`

## 1) Instalar dependencias

```bash
cd Encuentros-Front
npm install
```

## 2) Levantar la app

```bash
npm start
```

Luego abre la app en:

```text
http://localhost:4200
```

## 3) Compilar para producción

```bash
npm run build
```

## 4) Funcionalidad de recomendación

La home tiene una sección de intereses. El usuario puede elegir varios intereses y presionar `Recomiéndame`.

Los intereses disponibles incluyen:

- académico
- social
- tecnología
- cultural
- networking
- deportivo
- videojuegos
- música

La lógica que hace eso está en:

- src/app/fearues/pages/home/home.ts
- src/app/services/encuentro.service.ts

La llamada va al backend:

```text
POST http://localhost:3000/encuentro/recomendaciones
```

## 5) Si no compila

Asegurate de que:

- el backend está corriendo
- la base de datos está creada
- Ollama está levantado
- no tengas otro proceso usando el puerto 3000 o 4200

## 6) Comandos útiles

```bash
npm install
npm start
npm run build
```

## 7) Flujo normal para arrancar todo desde cero

```bash
# Backend
cd Encuentros-Back
npm install
npm run start:dev

# Frontend (otra terminal)
cd Encuentros-Front
npm install
npm start
```

Y además: PostgreSQL y Ollama deben estar corriendo antes de entrar a la app.
