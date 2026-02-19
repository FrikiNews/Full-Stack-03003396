function TaskTable({ tasks, onEdit, onDelete }) {
  const formatStatus = (status) => status.replace('_', ' ');
  const statusClass = (status) => {
    if (status === 'agotado') return 'status-badge status-agotado';
    if (status === 'bajo_stock') return 'status-badge status-bajo-stock';
    return 'status-badge status-disponible';
  };

  if (!tasks.length) {
    return <div className="card">No hay productos registrados.</div>;
  }

  return (
    <div className="card">
      <h2>Inventario actual</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Cantidad</th>
              <th>Stock mín.</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td>{task.productName}</td>
                <td>{task.category}</td>
                <td>{task.unit}</td>
                <td>{task.quantity}</td>
                <td>{task.minStock}</td>
                <td>{task.supplier || '-'}</td>
                <td>
                  <span className={statusClass(task.status)}>{formatStatus(task.status)}</span>
                </td>
                <td className="actions-cell">
                  <button type="button" onClick={() => onEdit(task)}>Editar</button>
                  <button type="button" className="btn-danger" onClick={() => onDelete(task._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskTable;
