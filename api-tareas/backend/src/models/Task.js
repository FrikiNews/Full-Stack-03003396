const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25
  },
  dateTime: {
    type: Date,
    required: true
  },
  people: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  tableNumber: {
    type: Number,
    min: 1,
    max: 200
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada'],
    default: 'pendiente'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 400
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
