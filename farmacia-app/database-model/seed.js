/* global db */

const randomPrice = () => Number((Math.random() * 250 + 30).toFixed(2));
const randomStock = () => Math.floor(Math.random() * 120) + 10;

const catalogBase = [
  { name: 'Paracetamol', category: 'Analgésico' },
  { name: 'Ibuprofeno', category: 'Antiinflamatorio' },
  { name: 'Naproxeno', category: 'Antiinflamatorio' },
  { name: 'Diclofenaco', category: 'Antiinflamatorio' },
  { name: 'Ketorolaco', category: 'Analgésico' },
  { name: 'Omeprazol', category: 'Gastrointestinal' },
  { name: 'Pantoprazol', category: 'Gastrointestinal' },
  { name: 'Loratadina', category: 'Antihistamínico' },
  { name: 'Cetirizina', category: 'Antihistamínico' },
  { name: 'Desloratadina', category: 'Antihistamínico' },
  { name: 'Ambroxol', category: 'Respiratorio' },
  { name: 'Dextrometorfano', category: 'Respiratorio' },
  { name: 'Guaifenesina', category: 'Respiratorio' },
  { name: 'Salbutamol', category: 'Respiratorio' },
  { name: 'Amoxicilina', category: 'Antibiótico' },
  { name: 'Azitromicina', category: 'Antibiótico' },
  { name: 'Ciprofloxacino', category: 'Antibiótico' },
  { name: 'Metformina', category: 'Antidiabético' },
  { name: 'Glibenclamida', category: 'Antidiabético' },
  { name: 'Losartán', category: 'Cardiovascular' },
  { name: 'Enalapril', category: 'Cardiovascular' },
  { name: 'Amlodipino', category: 'Cardiovascular' },
  { name: 'Atorvastatina', category: 'Cardiovascular' },
  { name: 'Simvastatina', category: 'Cardiovascular' },
  { name: 'Levotiroxina', category: 'Hormonal' },
  { name: 'Prednisona', category: 'Corticosteroide' },
  { name: 'Dexametasona', category: 'Corticosteroide' },
  { name: 'Fluconazol', category: 'Antifúngico' },
  { name: 'Clotrimazol', category: 'Antifúngico' },
  { name: 'Albendazol', category: 'Antiparasitario' },
  { name: 'Nitazoxanida', category: 'Antiparasitario' },
  { name: 'Loperamida', category: 'Gastrointestinal' },
  { name: 'Butilhioscina', category: 'Gastrointestinal' },
  { name: 'Ondansetrón', category: 'Gastrointestinal' },
  { name: 'Meloxicam', category: 'Antiinflamatorio' },
  { name: 'Celecoxib', category: 'Antiinflamatorio' },
  { name: 'Tramadol', category: 'Analgésico' },
  { name: 'Acetilcisteína', category: 'Respiratorio' },
  { name: 'Montelukast', category: 'Respiratorio' },
  { name: 'Furosemida', category: 'Cardiovascular' },
  { name: 'Hidroclorotiazida', category: 'Cardiovascular' },
  { name: 'Clopidogrel', category: 'Cardiovascular' },
  { name: 'Ácido fólico', category: 'Vitaminas' },
  { name: 'Vitamina C', category: 'Vitaminas' },
  { name: 'Vitamina D3', category: 'Vitaminas' },
  { name: 'Complejo B', category: 'Vitaminas' },
  { name: 'Calcio + D', category: 'Suplemento' },
  { name: 'Magnesio', category: 'Suplemento' },
  { name: 'Zinc', category: 'Suplemento' },
  { name: 'Omega 3', category: 'Suplemento' }
];

const variants = [
  { dosage: '250mg', presentation: 'Caja 20 tabletas' },
  { dosage: '500mg', presentation: 'Caja 10 cápsulas' }
];

const imagePool = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80'
];

const medicines = catalogBase.flatMap((base, baseIndex) =>
  variants.map((variant, variantIndex) => ({
    name: base.name,
    description: `${base.name} ${variant.dosage} de uso frecuente en farmacia.`,
    price: randomPrice(),
    stock: randomStock(),
    category: base.category,
    dosage: variant.dosage,
    presentation: variant.presentation,
    imageUrl: imagePool[(baseIndex + variantIndex) % imagePool.length],
    createdAt: new Date(),
    updatedAt: new Date()
  }))
);

const target = 100;
const finalMedicines = medicines.slice(0, target);

db.medicines.deleteMany({});
db.medicines.insertMany(finalMedicines);

print(`✅ Seed completado: ${finalMedicines.length} medicamentos insertados con máximo 2 variantes por base.`);
