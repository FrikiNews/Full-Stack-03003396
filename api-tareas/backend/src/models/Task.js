const mongoose = require('mongoose');

function calculateStatus(quantity, minStock) {
  const parsedQuantity = Number(quantity ?? 0);
  const parsedMinStock = Number(minStock ?? 0);

  if (parsedQuantity <= 0) {
    return 'agotado';
  }

  if (parsedQuantity <= parsedMinStock) {
    return 'bajo_stock';
  }

  return 'disponible';
}

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  unit: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    max: 100000
  },
  minStock: {
    type: Number,
    min: 0,
    max: 100000,
    default: 0
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: 120
  },
  status: {
    type: String,
    enum: ['disponible', 'bajo_stock', 'agotado'],
    default: 'disponible'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 400
  }
}, {
  timestamps: true
});

taskSchema.pre('validate', function autoStatusOnValidate(next) {
  this.status = calculateStatus(this.quantity, this.minStock);
  next();
});

taskSchema.pre('findOneAndUpdate', function autoStatusOnUpdate(next) {
  const update = this.getUpdate() || {};
  const quantity = update.quantity;
  const minStock = update.minStock;

  if (quantity === undefined && minStock === undefined) {
    return next();
  }

  update.status = calculateStatus(quantity, minStock);
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Task', taskSchema);
