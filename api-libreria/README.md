# API Librería (CRUD con MongoDB + Mongoose)

Proyecto fullstack básico para una librería:

- Backend: Node.js + Express + MongoDB + Mongoose
- Frontend: React + Vite
- Autenticación: JWT (registro/login)

## 1) Levantar MongoDB local

Asegúrate de tener MongoDB ejecutándose en tu equipo con la URI:

`mongodb://127.0.0.1:27017/libreria`

## 2) Ejecutar backend

```bash
cd backend
npm install
npm run dev
```

Backend disponible en `http://localhost:5000`.

## 3) Ejecutar frontend (React)

```bash
cd ../frontend
npm install
npm run dev
```

Luego entra a la URL que imprime Vite (normalmente `http://localhost:5173`).

## Endpoints CRUD

- `GET /api/books` - Listar libros
- `GET /api/books/:id` - Obtener libro por ID
- `POST /api/books` - Crear libro
- `PUT /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro

Todas las rutas de libros requieren token Bearer.

## Endpoints Auth

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión y obtener token

## Campos del libro

- `titulo` (string, requerido)
- `autor` (string, requerido)
- `genero` (string, requerido)
- `anioPublicacion` (number, requerido)
- `disponible` (boolean, opcional, default `true`)

## Pruebas con Jest

```bash
cd backend
npm test
```

El proyecto incluye pruebas automáticas de auth, roles y rutas protegidas.
