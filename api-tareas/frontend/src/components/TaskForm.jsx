import { useEffect, useState } from 'react';

const initialForm = {
  customerName: '',
  phone: '',
  dateTime: '',
  people: 2,
  tableNumber: '',
  status: 'pendiente',
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
      customerName: editingTask.customerName || '',
      phone: editingTask.phone || '',
      dateTime: editingTask.dateTime ? new Date(editingTask.dateTime).toISOString().slice(0, 16) : '',
      people: editingTask.people || 2,
      tableNumber: editingTask.tableNumber ?? '',
      status: editingTask.status || 'pendiente',
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
      people: Number(form.people),
      tableNumber: form.tableNumber === '' ? undefined : Number(form.tableNumber)
    });

    if (!editingTask) {
      setForm(initialForm);
    }
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h2>{editingTask ? 'Editar cita' : 'Nueva cita'}</h2>

      <label>
        Cliente
        <input name="customerName" value={form.customerName} onChange={handleChange} required />
      </label>

      <label>
        Teléfono
        <input name="phone" value={form.phone} onChange={handleChange} required />
      </label>

      <label>
        Fecha y hora
        <input type="datetime-local" name="dateTime" value={form.dateTime} onChange={handleChange} required />
      </label>

      <label>
        Personas
        <input type="number" min="1" max="30" name="people" value={form.people} onChange={handleChange} required />
      </label>

      <label>
        Mesa
        <input type="number" min="1" max="200" name="tableNumber" value={form.tableNumber} onChange={handleChange} />
      </label>

      <label>
        Estado
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </label>

      <label>
        Notas
        <textarea name="notes" value={form.notes} onChange={handleChange} maxLength={400} rows={3} />
      </label>

      <div className="form-actions">
        <button type="submit">{editingTask ? 'Guardar cambios' : 'Crear cita'}</button>
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
