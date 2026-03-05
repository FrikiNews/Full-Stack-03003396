db = db.getSiblingDB('farmacia_db');

db.createCollection('users');
db.createCollection('medicines');

db.users.createIndex({ email: 1 }, { unique: true });
db.medicines.createIndex({ name: 'text', category: 'text', description: 'text' });

print('Colecciones e índices de farmacia creados.');
