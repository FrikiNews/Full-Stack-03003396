function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      message: 'No autorizado. Inicia sesión para continuar.'
    });
  }

  next();
}

module.exports = { requireAuth };
