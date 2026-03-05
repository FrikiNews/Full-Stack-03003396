# Scripts de base de datos (MongoDB)

## Requisitos
- MongoDB corriendo localmente o en la nube.
- Cliente `mongosh` instalado.

## 1) Crear colecciones e índices
```bash
mongosh < database-model/init.js
```

## 2) Cargar datos demo de farmacia
```bash
mongosh < database-model/seed.js
```

## Notas
- Base usada: `farmacia_db`.
- El usuario admin se crea desde el endpoint de registro (`/api/auth/register`) usando `"role": "admin"`.
