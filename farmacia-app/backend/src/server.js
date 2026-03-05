require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const Medicine = require('./models/Medicine');
const { buildMedicines } = require('./scripts/seedDemo');

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'API farmacia activa' });
});

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);

const PORT = process.env.PORT || 4000;

async function runAutoSeedIfNeeded() {
  if (process.env.AUTO_SEED_ON_START !== 'true') {
    return;
  }

  const existingMedicines = await Medicine.countDocuments();
  if (existingMedicines > 0) {
    console.log(`Auto-seed omitido: ya existen ${existingMedicines} medicamentos.`);
    return;
  }

  const medicines = buildMedicines(100);
  await Medicine.insertMany(medicines);
  console.log(`Auto-seed aplicado: ${medicines.length} medicamentos cargados.`);
}

connectDB()
  .then(async () => {
    await runAutoSeedIfNeeded();
    app.listen(PORT, () => {
      console.log(`Servidor backend en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  });
