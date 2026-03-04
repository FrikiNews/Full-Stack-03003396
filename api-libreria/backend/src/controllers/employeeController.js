const bcrypt = require('bcryptjs');
const User = require('../models/User');

const listEmployees = async (req, res) => {
  try {
    const employees = await User.find({ rol: 'empleado' }, { password: 0 }).sort({ createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol: 'empleado'
    });

    return res.status(201).json({
      id: employee._id,
      nombre: employee.nombre,
      email: employee.email,
      rol: employee.rol
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear empleado' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const employee = await User.findById(req.params.id);

    if (!employee || employee.rol !== 'empleado') {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    if (email && email !== employee.email) {
      const duplicatedEmail = await User.findOne({ email });
      if (duplicatedEmail) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
      employee.email = email;
    }

    if (nombre) {
      employee.nombre = nombre;
    }

    if (password) {
      employee.password = await bcrypt.hash(password, 10);
    }

    await employee.save();

    return res.json({
      id: employee._id,
      nombre: employee.nombre,
      email: employee.email,
      rol: employee.rol
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar empleado' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee || employee.rol !== 'empleado') {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    await employee.deleteOne();

    return res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar empleado' });
  }
};

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
