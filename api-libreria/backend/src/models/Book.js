const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El titulo es obligatorio'],
      trim: true
    },
    autor: {
      type: String,
      required: [true, 'El autor es obligatorio'],
      trim: true
    },
    genero: {
      type: String,
      required: [true, 'El genero es obligatorio'],
      trim: true
    },
    anioPublicacion: {
      type: Number,
      required: [true, 'El año de publicacion es obligatorio'],
      min: [1400, 'El año no es valido']
    },
    disponible: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Book', bookSchema);
