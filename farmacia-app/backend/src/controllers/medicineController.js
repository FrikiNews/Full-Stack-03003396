const Medicine = require('../models/Medicine');

async function createMedicine(req, res) {
  try {
    const medicine = await Medicine.create(req.body);
    return res.status(201).json(medicine);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear medicamento', error: error.message });
  }
}

async function listMedicines(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const total = await Medicine.countDocuments(filter);
    const medicines = await Medicine.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      data: medicines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar medicamentos', error: error.message });
  }
}

async function getMedicineById(req, res) {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    return res.json(medicine);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener medicamento', error: error.message });
  }
}

async function updateMedicine(req, res) {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    return res.json(medicine);
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar medicamento', error: error.message });
  }
}

async function deleteMedicine(req, res) {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    return res.json({ message: 'Medicamento eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar medicamento', error: error.message });
  }
}

module.exports = {
  createMedicine,
  listMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine
};
