const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

describe('authMiddleware (JWT)', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_jwt';
  });

  function createMockRes() {
    return {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      }
    };
  }

  test('rechaza cuando no se manda Authorization header', () => {
    const req = { headers: {} };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza token inválido', () => {
    const req = { headers: { authorization: 'Bearer token_invalido' } };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('acepta token válido y carga req.user', () => {
    const payload = { id: '123', role: 'admin', email: 'admin@test.com' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({
      id: payload.id,
      role: payload.role,
      email: payload.email
    });
  });
});
