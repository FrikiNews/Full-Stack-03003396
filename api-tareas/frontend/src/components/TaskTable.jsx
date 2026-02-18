function formatDate(date) {
  return new Date(date).toLocaleString('es-MX');
}

function TaskTable({ tasks, onEdit, onDelete }) {
  if (!tasks.length) {
    return <div className="card">No hay citas registradas.</div>;
  }

  return (
    <div className="card">
      <h2>Citas registradas</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Fecha/Hora</th>
              <th>Personas</th>
              <th>Mesa</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td>{task.customerName}</td>
                <td>{task.phone}</td>
                <td>{formatDate(task.dateTime)}</td>
                <td>{task.people}</td>
                <td>{task.tableNumber || '-'}</td>
                <td>{task.status}</td>
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
