README para ejecutar desde un nuevo PC
1) Instalar lo necesario
Node.js LTS 20+
npm
PostgreSQL 15+
Ollama
Git
Instalaciones:

# Backend
cd Encuentros-Back
npm install

# Frontend
cd ../Encuentros-Front
npm install

2) Instalar PostgreSQL
Descargar desde:
https://www.postgresql.org/download/

Crear la base:

psql -U postgres
CREATE DATABASE encuentros;
\q

3) Crear el archivo .env del backend
En:
Encuentros-Back/.env

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=encuentros
JWT_SECRET=encuentros_secret_key_2025
PORT=3000
CORS_ORIGINS=http://localhost:4200
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

4) Instalar y levantar Ollama
Descargar:
https://ollama.com/download

Luego correr:

ollama serve
ollama pull llama3.2


5) Crear la BD en PostgreSQL
Ejecuta esto una sola vez:


CREATE TABLE usuarios (id_usuario SERIAL PRIMARY KEY, nombre VARCHAR(100) NOT NULL, apellido VARCHAR(100), email VARCHAR(150) NOT NULL, contrasena VARCHAR(200) NOT NULL, imagen_perfil VARCHAR(255), fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, reset_password_token VARCHAR(255));
CREATE TABLE encuentros (id_encuentro SERIAL PRIMARY KEY, id_creador INTEGER NOT NULL, titulo VARCHAR(200) NOT NULL, descripcion VARCHAR(500) NOT NULL, lugar VARCHAR(100) NOT NULL, fecha TIMESTAMP NOT NULL, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE participantes_encuentro (id_participacion SERIAL PRIMARY KEY, id_encuentro INTEGER NOT NULL, id_usuario INTEGER NOT NULL, rol VARCHAR(50) NOT NULL);
CREATE TABLE presupuestos (id_presupuesto SERIAL PRIMARY KEY, id_encuentro INTEGER NOT NULL, presupuesto_total NUMERIC(15,2) DEFAULT 0);
CREATE TABLE items_presupuesto (id_item SERIAL PRIMARY KEY, id_presupuesto INTEGER NOT NULL, id_encuentro INTEGER NOT NULL, nombre_item VARCHAR(200) NOT NULL, monto_item NUMERIC(15,2) NOT NULL);
CREATE TABLE bolsillos (id_bolsillo SERIAL PRIMARY KEY, id_presupuesto INTEGER, id_encuentro INTEGER NOT NULL, nombre VARCHAR(200) NOT NULL, saldo_actual NUMERIC(15,2) DEFAULT 0);
CREATE TABLE aportes (id_aporte SERIAL PRIMARY KEY, id_bolsillo INTEGER, id_encuentro INTEGER NOT NULL, id_usuario INTEGER, monto NUMERIC(10,2) NOT NULL, fecha_aporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE gastos (id_gasto SERIAL PRIMARY KEY, id_bolsillo INTEGER NOT NULL, id_encuentro INTEGER NOT NULL, id_usuario INTEGER, descripcion VARCHAR(200) NOT NULL, monto NUMERIC(10,2) NOT NULL, fecha_gasto TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE mensajes (id_mensaje SERIAL PRIMARY KEY, id_encuentro INTEGER NOT NULL, id_usuario INTEGER NOT NULL, contenido TEXT NOT NULL, fecha_mensaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE relaciones_amistades (id_relacion_amistad SERIAL PRIMARY KEY, id_usuario INTEGER NOT NULL, estado VARCHAR(20) NOT NULL, fecha_solicitud_amistad TIMESTAMP DEFAULT CURRENT_TIMESTAMP, fecha_aceptacion_amistad TIMESTAMP);
CREATE TABLE solicitudes_amistad (id_solicitud SERIAL PRIMARY KEY, id_remitente INTEGER NOT NULL, id_relacion_amistad INTEGER NOT NULL, id_destinatario INTEGER NOT NULL, estado VARCHAR(20) DEFAULT 'pendiente', fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE amistades (id_amistad SERIAL PRIMARY KEY, id_relacion_amistad INTEGER NOT NULL, usuario1 INTEGER NOT NULL, usuario2 INTEGER NOT NULL, fecha_amistad TIMESTAMP DEFAULT CURRENT_TIMESTAMP);


6) Arrancar backend
cd Encuentros-Back
npm run start:dev

7) Arrancar frontend

cd Encuentros-Front
npm start
http://localhost:4200




Cómo funciona la recomendación
La lógica actual combina dos cosas:

Intereses del usuario

En Encuentros-Front/src/app/fearues/pages/home/home.ts, el usuario elige chips como:
tecnología
social
música
videojuegos
académico
Eso se guarda en selectedInterests.
Eventos que existen en la app

Luego se arma una lista con los eventos actuales (this.encuentros), y cada uno se clasifica por categoría usando inferEventCategory().
Ejemplo: si el evento dice “Meetup de IA”, se marca como tecnología; si dice “Concierto”, como cultural; si dice “torneo de FIFA”, como videojuegos.
Después, la app envía esto al backend:

intereses seleccionados
lista de eventos disponibles
y el endpoint en Encuentros-Back/src/encuentro/encuentro.controller.ts hace esto:

arma un prompt para Ollama
le dice: “ordená estos eventos según los intereses del usuario”
Ollama devuelve un JSON con recomendaciones, match y motivo
Entonces, ¿qué pesa más?
En la práctica, la prioridad es esta:

primero los intereses del usuario
después la categoría/descripción del evento
y si no hay mucha coincidencia, cae a un fallback con eventos próximos
Es decir:

Si el usuario elige “música + social”, la IA va a priorizar eventos con esas características.
Si un evento recién publicado encaja con esos intereses, aparece arriba.
Si no hay coincidencia fuerte, igual muestra eventos próximos como respaldo.
En pocas palabras
Sí, hay dos niveles:

“Se recomiendan más eventos parecidos al que la persona publica” en el sentido de que la IA analiza la categoría y descripción del evento para ver qué tan bien encaja con el usuario.
“Se recomiendan otros eventos según los intereses que seleccionó” porque los intereses tienen prioridad directa.
La recomendación final es una mezcla de ambas.

O sea: no es solo por lo que publica la gente, ni solo por los intereses; es por la combinación de ambos.


En resumen, la funcionalidad quedó así:

En el frontend, la home ya no recomienda a ciegas: el usuario elige intereses y al hacer clic en “Recomiéndame” se envían esos intereses al backend junto con los eventos disponibles. Eso está en Encuentros-Front/src/app/fearues/pages/home/home.ts y la UI en Encuentros-Front/src/app/fearues/pages/home/home.html.
El servicio de eventos hace la llamada al endpoint de recomendación: Encuentros-Front/src/app/services/encuentro.service.ts.
En el backend, el endpoint POST /encuentro/recomendaciones recibe intereses + eventos, arma un prompt y lo manda a Ollama con http://localhost:11434/api/generate. Eso está en Encuentros-Back/src/encuentro/encuentro.controller.ts.
Se añadieron intereses nuevos para el usuario: videojuegos y música, y la categorización de eventos los reconoce mejor.
