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
  const { customerName, phone, dateTime, people, tableNumber, status, notes } = req.body;

  if (!customerName || customerName.trim().length < 2) {
    return res.status(400).json({ message: 'El nombre del cliente es obligatorio.' });
  }

  if (!phone || phone.trim().length < 7) {
    return res.status(400).json({ message: 'El teléfono es obligatorio y debe ser válido.' });
  }

  const parsedDate = new Date(dateTime);
  if (!dateTime || Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: 'Fecha/hora inválida.' });
  }

  const parsedPeople = Number(people);
  if (!Number.isInteger(parsedPeople) || parsedPeople < 1 || parsedPeople > 30) {
    return res.status(400).json({ message: 'Las personas deben ser un entero entre 1 y 30.' });
  }

  if (tableNumber !== undefined && tableNumber !== null && tableNumber !== '') {
    const parsedTable = Number(tableNumber);
    if (!Number.isInteger(parsedTable) || parsedTable < 1 || parsedTable > 200) {
      return res.status(400).json({ message: 'La mesa debe ser un entero entre 1 y 200.' });
    }
  }

  if (status && !['pendiente', 'confirmada', 'cancelada'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido.' });
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
