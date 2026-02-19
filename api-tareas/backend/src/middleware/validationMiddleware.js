function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres.' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Correo electrónico inválido.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Correo electrónico inválido.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'La contraseña es obligatoria.' });
  }

  next();
}

function validateTask(req, res, next) {
  const { productName, category, unit, quantity, minStock, supplier, notes } = req.body;

  if (!productName || productName.trim().length < 2) {
    return res.status(400).json({ message: 'El nombre del producto es obligatorio.' });
  }

  if (!category || category.trim().length < 2) {
    return res.status(400).json({ message: 'La categoría es obligatoria.' });
  }

  if (!unit || !['kg', 'litros', 'piezas', 'cajas'].includes(unit)) {
    return res.status(400).json({ message: 'La unidad es inválida.' });
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0 || parsedQuantity > 100000) {
    return res.status(400).json({ message: 'La cantidad debe estar entre 0 y 100000.' });
  }

  if (minStock !== undefined && minStock !== null && minStock !== '') {
    const parsedMinStock = Number(minStock);
    if (!Number.isFinite(parsedMinStock) || parsedMinStock < 0 || parsedMinStock > 100000) {
      return res.status(400).json({ message: 'El stock mínimo debe estar entre 0 y 100000.' });
    }
  }

  if (supplier && supplier.trim().length > 120) {
    return res.status(400).json({ message: 'El proveedor no puede superar 120 caracteres.' });
  }

  if (notes && notes.length > 400) {
    return res.status(400).json({ message: 'Las notas no pueden superar 400 caracteres.' });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};
