import { useEffect, useState } from 'react';

const initialForm = {
  productName: '',
  category: '',
  unit: 'piezas',
  quantity: 0,
  minStock: 0,
  supplier: '',
  notes: ''
};

function TaskForm({ editingTask, onSubmit, onCancelEdit }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!editingTask) {
      setForm(initialForm);
      return;
    }

    setForm({
      productName: editingTask.productName || '',
      category: editingTask.category || '',
      unit: editingTask.unit || 'piezas',
      quantity: editingTask.quantity ?? 0,
      minStock: editingTask.minStock ?? 0,
      supplier: editingTask.supplier || '',
      notes: editingTask.notes || ''
    });
  }, [editingTask]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      ...form,
      quantity: Number(form.quantity),
      minStock: Number(form.minStock)
    });

    if (!editingTask) {
      setForm(initialForm);
    }
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h2>{editingTask ? 'Editar producto' : 'Nuevo producto'}</h2>

      <label>
        Producto
        <input name="productName" value={form.productName} onChange={handleChange} required />
      </label>

      <label>
        Categoría
        <input name="category" value={form.category} onChange={handleChange} required />
      </label>

      <label>
        Unidad
        <select name="unit" value={form.unit} onChange={handleChange}>
          <option value="piezas">Piezas</option>
          <option value="kg">Kg</option>
          <option value="litros">Litros</option>
          <option value="cajas">Cajas</option>
        </select>
      </label>

      <label>
        Cantidad
        <input type="number" min="0" max="100000" name="quantity" value={form.quantity} onChange={handleChange} required />
      </label>

      <label>
        Stock mínimo
        <input type="number" min="0" max="100000" name="minStock" value={form.minStock} onChange={handleChange} required />
      </label>

      <label>
        Proveedor
        <input name="supplier" value={form.supplier} onChange={handleChange} />
      </label>

      <label>
        Notas
        <textarea name="notes" value={form.notes} onChange={handleChange} maxLength={400} rows={3} />
      </label>

      <div className="form-actions">
        <button type="submit">{editingTask ? 'Guardar cambios' : 'Crear producto'}</button>
        {editingTask && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
