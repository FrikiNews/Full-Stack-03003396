import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';

function MedicineDetailPage() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMedicine() {
      try {
        const data = await api.getMedicine(id);
        setMedicine(data);
      } catch (fetchError) {
        setError(fetchError.message);
      }
    }

    fetchMedicine();
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <Link to="/">Volver</Link>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="container">
        <p>Cargando detalle...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>{medicine.name}</h2>
        <p>
          <strong>Categoría:</strong> {medicine.category}
        </p>
        <p>
          <strong>Descripción:</strong> {medicine.description || 'Sin descripción'}
        </p>
        <p>
          <strong>Precio:</strong> ${medicine.price.toFixed(2)}
        </p>
        <p>
          <strong>Stock:</strong> {medicine.stock}
        </p>
        <p>
          <strong>Fabricante:</strong> {medicine.manufacturer || 'No especificado'}
        </p>
        <p>
          <strong>Requiere receta:</strong> {medicine.prescriptionRequired ? 'Sí' : 'No'}
        </p>
        <Link to="/">Volver al panel</Link>
      </div>
    </div>
  );
}

export default MedicineDetailPage;
