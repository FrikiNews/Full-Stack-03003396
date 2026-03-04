const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Book = require('../src/models/Book');

process.env.JWT_SECRET = 'test_secret';

const app = require('../src/app');

let mongoServer;
let adminToken;
let employeeToken;
let consumerToken;
let seededBookId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

beforeEach(async () => {
  const passwordHash = await bcrypt.hash('123456', 10);

  await User.insertMany([
    {
      nombre: 'Jefe Principal',
      email: 'jefe@libreria.com',
      password: passwordHash,
      rol: 'admin'
    },
    {
      nombre: 'Empleado 1',
      email: 'empleado1@libreria.com',
      password: passwordHash,
      rol: 'empleado'
    },
    {
      nombre: 'Empleado 2',
      email: 'empleado2@libreria.com',
      password: passwordHash,
      rol: 'empleado'
    },
    {
      nombre: 'Empleado 3',
      email: 'empleado3@libreria.com',
      password: passwordHash,
      rol: 'empleado'
    },
    {
      nombre: 'Empleado 4',
      email: 'empleado4@libreria.com',
      password: passwordHash,
      rol: 'empleado'
    },
    {
      nombre: 'Empleado 5',
      email: 'empleado5@libreria.com',
      password: passwordHash,
      rol: 'empleado'
    },
    {
      nombre: 'Consumidor Prueba',
      email: 'consumidor@libreria.com',
      password: passwordHash,
      rol: 'consumidor'
    }
  ]);

  const seededBooks = Array.from({ length: 10 }, (_, index) => ({
    titulo: `Libro Seed ${index + 1}`,
    autor: `Autor ${index + 1}`,
    genero: index % 2 === 0 ? 'Novela' : 'Ensayo',
    anioPublicacion: 2000 + index,
    disponible: index % 3 !== 0
  }));

  const createdBooks = await Book.insertMany(seededBooks);
  seededBookId = createdBooks[0]._id.toString();

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'jefe@libreria.com',
    password: '123456',
    rol: 'admin'
  });

  const employeeLogin = await request(app).post('/api/auth/login').send({
    email: 'empleado1@libreria.com',
    password: '123456',
    rol: 'empleado'
  });

  const consumerLogin = await request(app).post('/api/auth/login').send({
    email: 'consumidor@libreria.com',
    password: '123456',
    rol: 'consumidor'
  });

  adminToken = adminLogin.body.token;
  employeeToken = employeeLogin.body.token;
  consumerToken = consumerLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth, roles y catálogo con datos sembrados en prueba', () => {
  test('debe iniciar con 10 libros, 5 empleados y cuenta jefe/admin', async () => {
    const booksResponse = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${adminToken}`);

    const employeesResponse = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(booksResponse.statusCode).toBe(200);
    expect(booksResponse.body).toHaveLength(10);

    expect(employeesResponse.statusCode).toBe(200);
    expect(employeesResponse.body).toHaveLength(5);

    const bossUser = await User.findOne({ email: 'jefe@libreria.com' });
    expect(bossUser).toBeTruthy();
    expect(bossUser.rol).toBe('admin');
  });

  test('admin puede crear y eliminar empleados', async () => {
    const createEmployeeResponse = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Empleado Extra',
        email: 'empleado.extra@libreria.com',
        password: '123456'
      });

    expect(createEmployeeResponse.statusCode).toBe(201);

    const employeesAfterCreate = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(employeesAfterCreate.body).toHaveLength(6);

    const deleteEmployeeResponse = await request(app)
      .delete(`/api/employees/${createEmployeeResponse.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteEmployeeResponse.statusCode).toBe(200);
    expect(deleteEmployeeResponse.body.message).toBe('Empleado eliminado correctamente');
  });

  test('empleado puede editar libros pero no eliminar', async () => {
    const updateResponse = await request(app)
      .put(`/api/books/${seededBookId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ disponible: false });

    const deleteResponse = await request(app)
      .delete(`/api/books/${seededBookId}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.disponible).toBe(false);

    expect(deleteResponse.statusCode).toBe(403);
    expect(deleteResponse.body.message).toBe('Acceso denegado: permisos insuficientes');
  });

  test('consumidor no puede crear, editar ni eliminar libros', async () => {
    const createResponse = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        titulo: 'Libro consumidor',
        autor: 'Usuario final',
        genero: 'Prueba',
        anioPublicacion: 2024,
        disponible: true
      });

    const updateResponse = await request(app)
      .put(`/api/books/${seededBookId}`)
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ disponible: false });

    const deleteResponse = await request(app)
      .delete(`/api/books/${seededBookId}`)
      .set('Authorization', `Bearer ${consumerToken}`);

    expect(createResponse.statusCode).toBe(403);
    expect(updateResponse.statusCode).toBe(403);
    expect(deleteResponse.statusCode).toBe(403);
  });
});
