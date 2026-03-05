import { useEffect, useState } from 'react';

const categoryOptions = [
  'Analgésico',
  'Antiinflamatorio',
  'Antibiótico',
  'Antialérgico',
  'Antihistamínico',
  'Respiratorio',
  'Gastrointestinal',
  'Cardiovascular',
  'Vitaminas',
  'Suplemento',
  'Dermatológico',
  'Antifúngico',
  'Antiparasitario'
];

const initialState = {
  name: '',
  category: '',
  description: '',
  imageUrl: '',
  price: '',
  stock: '',
  prescriptionRequired: false,
  manufacturer: ''
};

function MedicineForm({ onSubmit, selectedMedicine, onCancel }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (selectedMedicine) {
      setFormData({
        name: selectedMedicine.name || '',
        category: selectedMedicine.category || '',
        description: selectedMedicine.description || '',
        imageUrl: selectedMedicine.imageUrl || '',
        price: selectedMedicine.price ?? '',
        stock: selectedMedicine.stock ?? '',
        prescriptionRequired: Boolean(selectedMedicine.prescriptionRequired),
        manufacturer: selectedMedicine.manufacturer || ''
      });
    } else {
      setFormData(initialState);
    }
  }, [selectedMedicine]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function handleTogglePrescription() {
    setFormData((prev) => ({
      ...prev,
      prescriptionRequired: !prev.prescriptionRequired
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    });

    if (!selectedMedicine) {
      setFormData(initialState);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-header-row">
        <h3>{selectedMedicine ? 'Editar medicamento' : 'Nuevo medicamento'}</h3>
        <button
          type="button"
          className={`prescription-toggle-btn ${formData.prescriptionRequired ? 'active' : ''}`}
          onClick={handleTogglePrescription}
          aria-pressed={formData.prescriptionRequired}
          aria-label={formData.prescriptionRequired ? 'Requiere receta activado' : 'Requiere receta desactivado'}
        >
          Requiere receta
        </button>
      </div>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nombre"
        aria-label="Nombre del medicamento"
        required
      />
      <select name="category" value={formData.category} onChange={handleChange} aria-label="Categoría" required>
        <option value="" disabled>
          Selecciona una categoría
        </option>
        {categoryOptions.map((categoryOption) => (
          <option key={categoryOption} value={categoryOption}>
            {categoryOption}
          </option>
        ))}
      </select>
      <input
        name="manufacturer"
        value={formData.manufacturer}
        onChange={handleChange}
        placeholder="Fabricante"
        aria-label="Fabricante"
      />
      <input
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleChange}
        placeholder="URL de imagen"
        aria-label="URL de imagen"
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Descripción"
        rows="3"
        aria-label="Descripción"
      />
      <input
        name="price"
        type="number"
        min="0"
        step="0.01"
        value={formData.price}
        onChange={handleChange}
        placeholder="Precio"
        aria-label="Precio"
        required
      />
      <input
        name="stock"
        type="number"
        min="0"
        value={formData.stock}
        onChange={handleChange}
        placeholder="Stock"
        aria-label="Stock"
        required
      />
      <div className="row gap">
        <button type="submit">{selectedMedicine ? 'Actualizar' : 'Crear'}</button>
        {selectedMedicine && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}

export default MedicineForm;
