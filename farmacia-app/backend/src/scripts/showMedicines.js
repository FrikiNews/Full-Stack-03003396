const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmacia_db';
    await mongoose.connect(mongoUri);

    const medicines = await Medicine.find().sort({ createdAt: -1 }).limit(50);

    if (!medicines.length) {
      console.log('No hay medicamentos cargados.');
      return;
    }

    medicines.forEach((medicine, index) => {
      console.log(
        `${index + 1}. ${medicine.name} | ${medicine.category} | $${medicine.price} | stock:${medicine.stock}`
      );
    });
  } catch (error) {
    console.error('Error consultando medicamentos:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
