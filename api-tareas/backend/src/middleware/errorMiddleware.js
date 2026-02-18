function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada.' });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor.';

  res.status(statusCode).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
