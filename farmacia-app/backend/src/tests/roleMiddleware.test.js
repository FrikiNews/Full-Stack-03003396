const roleMiddleware = require('../middleware/roleMiddleware');

describe('roleMiddleware', () => {
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

  test('bloquea cuando no hay req.user', () => {
    const middleware = roleMiddleware('admin');
    const req = {};
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: 'No tienes permisos para esta acción' });
    expect(next).not.toHaveBeenCalled();
  });

  test('bloquea cuando role no está permitido', () => {
    const middleware = roleMiddleware('admin');
    const req = { user: { role: 'usuario' } };
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: 'No tienes permisos para esta acción' });
    expect(next).not.toHaveBeenCalled();
  });

  test('permite cuando role está en allowedRoles', () => {
    const middleware = roleMiddleware('admin', 'usuario');
    const req = { user: { role: 'usuario' } };
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
