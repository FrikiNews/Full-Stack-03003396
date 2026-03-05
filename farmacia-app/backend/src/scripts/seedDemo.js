const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

function buildMedicines(total = 100) {
  const molecules = [
    { name: 'Paracetamol', category: 'Analgésico', prescriptionRequired: false },
    { name: 'Ibuprofeno', category: 'Analgésico', prescriptionRequired: false },
    { name: 'Naproxeno', category: 'Analgésico', prescriptionRequired: false },
    { name: 'Diclofenaco', category: 'Analgésico', prescriptionRequired: true },
    { name: 'Ketorolaco', category: 'Analgésico', prescriptionRequired: true },
    { name: 'Amoxicilina', category: 'Antibiótico', prescriptionRequired: true },
    { name: 'Azitromicina', category: 'Antibiótico', prescriptionRequired: true },
    { name: 'Cefalexina', category: 'Antibiótico', prescriptionRequired: true },
    { name: 'Clindamicina', category: 'Antibiótico', prescriptionRequired: true },
    { name: 'Ciprofloxacino', category: 'Antibiótico', prescriptionRequired: true },
    { name: 'Loratadina', category: 'Antialérgico', prescriptionRequired: false },
    { name: 'Cetirizina', category: 'Antialérgico', prescriptionRequired: false },
    { name: 'Fexofenadina', category: 'Antialérgico', prescriptionRequired: false },
    { name: 'Desloratadina', category: 'Antialérgico', prescriptionRequired: false },
    { name: 'Levocetirizina', category: 'Antialérgico', prescriptionRequired: false },
    { name: 'Omeprazol', category: 'Gastrointestinal', prescriptionRequired: false },
    { name: 'Pantoprazol', category: 'Gastrointestinal', prescriptionRequired: false },
    { name: 'Esomeprazol', category: 'Gastrointestinal', prescriptionRequired: false },
    { name: 'Famotidina', category: 'Gastrointestinal', prescriptionRequired: false },
    { name: 'Loperamida', category: 'Gastrointestinal', prescriptionRequired: false },
    { name: 'Ambroxol', category: 'Respiratorio', prescriptionRequired: false },
    { name: 'Acetilcisteína', category: 'Respiratorio', prescriptionRequired: false },
    { name: 'Salbutamol', category: 'Respiratorio', prescriptionRequired: true },
    { name: 'Budesonida', category: 'Respiratorio', prescriptionRequired: true },
    { name: 'Dextrometorfano', category: 'Respiratorio', prescriptionRequired: false },
    { name: 'Vitamina C', category: 'Vitaminas', prescriptionRequired: false },
    { name: 'Vitamina D3', category: 'Vitaminas', prescriptionRequired: false },
    { name: 'Complejo B', category: 'Vitaminas', prescriptionRequired: false },
    { name: 'Ácido Fólico', category: 'Vitaminas', prescriptionRequired: false },
    { name: 'Multivitamínico', category: 'Vitaminas', prescriptionRequired: false },
    { name: 'Melatonina', category: 'Suplemento', prescriptionRequired: false },
    { name: 'Magnesio', category: 'Suplemento', prescriptionRequired: false },
    { name: 'Omega 3', category: 'Suplemento', prescriptionRequired: false },
    { name: 'Probióticos', category: 'Suplemento', prescriptionRequired: false },
    { name: 'Colágeno', category: 'Suplemento', prescriptionRequired: false },
    { name: 'Hidrocortisona', category: 'Dermatológico', prescriptionRequired: true },
    { name: 'Clotrimazol', category: 'Dermatológico', prescriptionRequired: false },
    { name: 'Miconazol', category: 'Dermatológico', prescriptionRequired: false },
    { name: 'Betametasona', category: 'Dermatológico', prescriptionRequired: true },
    { name: 'Neomicina', category: 'Dermatológico', prescriptionRequired: true },
    { name: 'Metformina', category: 'Metabólico', prescriptionRequired: true },
    { name: 'Glibenclamida', category: 'Metabólico', prescriptionRequired: true },
    { name: 'Losartán', category: 'Cardiovascular', prescriptionRequired: true },
    { name: 'Amlodipino', category: 'Cardiovascular', prescriptionRequired: true },
    { name: 'Enalapril', category: 'Cardiovascular', prescriptionRequired: true },
    { name: 'Atorvastatina', category: 'Cardiovascular', prescriptionRequired: true },
    { name: 'Simvastatina', category: 'Cardiovascular', prescriptionRequired: true },
    { name: 'Fluconazol', category: 'Antifúngico', prescriptionRequired: true },
    { name: 'Itraconazol', category: 'Antifúngico', prescriptionRequired: true },
    { name: 'Albendazol', category: 'Antiparasitario', prescriptionRequired: false }
  ];

  const variantA = { dosage: '250mg', presentation: 'Tabletas caja 10' };
  const variantB = { dosage: '500mg', presentation: 'Tabletas caja 20' };

  const manufacturers = [
    'BioHealth Labs',
    'Farmacéutica Nova',
    'MediPlus',
    'NaturalCare',
    'Salud Integral',
    'PharmaVida'
  ];

  const medicines = [];

  for (const [index, molecule] of molecules.entries()) {
    if (medicines.length >= total) break;

    const variants = [variantA, variantB];
    for (const [variantIndex, variant] of variants.entries()) {
      if (medicines.length >= total) break;

      const imageText = encodeURIComponent(`${molecule.name} ${variant.dosage}`);
      medicines.push({
        name: `${molecule.name} ${variant.dosage} ${variant.presentation}`,
        category: molecule.category,
        description: `${molecule.name} ${variant.dosage} en presentación ${variant.presentation}.`,
        price: Number((42 + (index % 9) * 4.1 + variantIndex * 2.9).toFixed(2)),
        stock: 22 + ((index * 11 + variantIndex * 7) % 150),
        prescriptionRequired: molecule.prescriptionRequired,
        manufacturer: manufacturers[index % manufacturers.length],
        imageUrl: `https://placehold.co/320x220/e7f1f6/2f5f78?text=${imageText}`
      });
    }
  }

  return medicines.slice(0, total);
}

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmacia_db';
    await mongoose.connect(mongoUri);

    const medicines = buildMedicines(100);

    await Medicine.deleteMany({});
    await Medicine.insertMany(medicines);

    const total = await Medicine.countDocuments();
    const uniqueNames = (await Medicine.distinct('name')).length;

    console.log(`Seed OK. Medicamentos cargados: ${total}`);
    console.log(`Nombres únicos: ${uniqueNames}`);
  } catch (error) {
    console.error('Error ejecutando seed demo:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = {
  buildMedicines,
  run
};

if (require.main === module) {
  run();
}
