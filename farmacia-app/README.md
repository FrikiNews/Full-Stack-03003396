# Farmacia App (React + Node + MongoDB)

## Estructura del proyecto

- `/frontend`
- `/backend`
- `/database-model`

## Funcionalidades

- Login y registro con JWT.
- Roles: `admin` y `employee`.
- CRUD de medicamentos (crear/editar/eliminar solo admin).
- Catálogo con búsqueda, categorías, secciones y promociones.
- Carrito y flujo de pago (demo).

---

## Requisitos

### Opción recomendada (Docker)

- Docker Desktop instalado y en ejecución.
- Docker Compose v2 (`docker compose version`).

### Opción local (sin Docker)

- Node.js 20+
- npm 10+
- MongoDB local (servicio activo)

---

## Instalación y ejecución con Docker (recomendada)

Desde la raíz del proyecto:

```bash
docker compose up --build -d
```

Servicios disponibles:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`

### Seed automática

El backend ya está configurado para sembrar datos automáticamente al iniciar **solo si la colección está vacía** (`AUTO_SEED_ON_START=true` en `docker-compose.yml`).

Si quieres correrla manualmente de todas formas:

```bash
docker compose exec backend node src/scripts/seedDemo.js
```

Verificar cantidad de productos:

```bash
docker compose exec mongo mongosh farmacia_db --quiet --eval 'db.medicines.countDocuments()'
```

### Comandos útiles Docker

```bash
# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Detener y borrar volumen (reinicio completo de datos)
docker compose down -v
```

> Nota: MongoDB en Docker se usa internamente por la red de Compose (no se expone al host para evitar conflictos de puerto).

---

## Instalación y ejecución local (sin Docker)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend: `http://localhost:4000`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### 3) Seed local manual (opcional)

Con backend y Mongo local disponibles:

```bash
cd backend
node src/scripts/seedDemo.js
```

---

## Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/medicines?page=1&limit=5&search=paracetamol`
- `GET /api/medicines/:id`
- `POST /api/medicines` (admin)
- `PUT /api/medicines/:id` (admin)
- `DELETE /api/medicines/:id` (admin)

---

## Pruebas JWT (backend)

Se agregaron pruebas automáticas para autenticación y autorización:

- Validación de token en `authMiddleware`
- Validación de roles en `roleMiddleware`
- Integración de login (`/api/auth/login`) con `supertest`

Ejecución:

```bash
cd backend
npm install
npm test
```

Archivos de prueba:

- `backend/src/tests/authMiddleware.test.js`
- `backend/src/tests/roleMiddleware.test.js`
- `backend/src/tests/authLogin.integration.test.js`

---

## Notas de uso

- Para panel administrativo, registra un usuario con `role: "admin"`.
- El frontend consume API en `http://localhost:4000/api`.
