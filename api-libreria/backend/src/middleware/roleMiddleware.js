const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.rol)) {
    return res.status(403).json({ message: 'Acceso denegado: permisos insuficientes' });
  }

  return next();
};

module.exports = authorizeRoles;
