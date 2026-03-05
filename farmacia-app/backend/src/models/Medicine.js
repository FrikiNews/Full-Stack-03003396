const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    manufacturer: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', category: 'text', description: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
