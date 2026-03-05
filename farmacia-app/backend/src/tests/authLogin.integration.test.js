const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');

jest.mock('../models/User');
jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'),
  compare: jest.fn()
}));

describe('Integración /api/auth/login', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_jwt';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('retorna 400 cuando faltan correo o contraseña', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: '' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Correo y contraseña son obligatorios');
  });

  test('retorna 401 cuando el usuario no existe', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: '123456' });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'noexiste@test.com' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciales inválidas');
  });

  test('retorna 401 cuando la contraseña es incorrecta', async () => {
    User.findOne.mockResolvedValue({
      _id: 'user-1',
      email: 'empleado@test.com',
      password: 'hash_guardado',
      role: 'employee',
      name: 'Empleado'
    });
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'empleado@test.com', password: 'incorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciales inválidas');
  });

  test('retorna 200 y token válido cuando credenciales correctas', async () => {
    const fakeUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'admin@test.com',
      password: 'hash_guardado',
      role: 'admin',
      name: 'Admin'
    };

    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'correcta' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin'
    });

    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({
      email: 'admin@test.com',
      role: 'admin',
      name: 'Admin'
    });
  });
});
