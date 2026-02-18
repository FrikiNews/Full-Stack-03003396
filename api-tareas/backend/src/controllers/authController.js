const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash
    });

    req.session.userId = user._id.toString();
    req.session.userName = user.name;

    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    req.session.userId = user._id.toString();
    req.session.userName = user.name;

    res.json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada correctamente.' });
  });
}

async function me(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado.' });
    }

    const user = await User.findById(req.session.userId).select('name email');
    if (!user) {
      return res.status(401).json({ message: 'Sesión inválida.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  me
};
