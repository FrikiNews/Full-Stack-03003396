import { useEffect, useState } from 'react';
import { api } from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskTable from '../components/TaskTable';

function DashboardPage({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadTasks = async () => {
    try {
      const data = await api.listTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (payload) => {
    setError('');
    setMessage('');

    try {
      if (editingTask) {
        await api.updateTask(editingTask._id, payload);
        setEditingTask(null);
        setMessage('Producto actualizado correctamente.');
      } else {
        await api.createTask(payload);
        setMessage('Producto creado correctamente.');
      }

      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setMessage('');

    try {
      await api.deleteTask(id);
      await loadTasks();
      setMessage('Producto eliminado correctamente.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSyncFile = async () => {
    setError('');
    setMessage('');

    try {
      const data = await api.syncTasksToFile();
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      setError(err.message);
    } finally {
      onLogout();
    }
  };

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Gestor de Inventario - Restaurante</h1>
          <p>Bienvenido, {user.name}</p>
        </div>

        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={handleSyncFile}>
            Sincronizar a archivo
          </button>
          <button type="button" className="btn-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}

      <section className="layout-grid">
        <TaskForm
          editingTask={editingTask}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingTask(null)}
        />

        <TaskTable
          tasks={tasks}
          onEdit={setEditingTask}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}

export default DashboardPage;
