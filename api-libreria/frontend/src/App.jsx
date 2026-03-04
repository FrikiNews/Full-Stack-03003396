import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_URL = `${API_BASE_URL}/auth`;
const BOOKS_URL = `${API_BASE_URL}/books`;
const TOKEN_KEY = 'libreria_token';
const USER_KEY = 'libreria_user';

const initialBookForm = {
  titulo: '',
  autor: '',
  genero: '',
  anioPublicacion: '',
  disponible: true
};

function App() {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('');
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ nombre: '', email: '', password: '', rol: 'consumidor' });
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [editingId, setEditingId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({ nombre: '', email: '', password: '' });
  const [editingEmployeeId, setEditingEmployeeId] = useState('');
  const totalBooks = books.length;
  const availableBooks = books.filter((book) => book.disponible).length;
  const isAdmin = user?.rol === 'admin';
  const isEmployee = user?.rol === 'empleado';
  const canManageBooks = isAdmin || isEmployee;
  const canDeleteBooks = isAdmin;
  const roleLabels = {
    admin: 'Admin',
    empleado: 'Empleado',
    consumidor: 'Consumidor'
  };
  const currentRoleLabel = roleLabels[user?.rol] || 'Consumidor';

  const authHeaders = token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    : {
        'Content-Type': 'application/json'
      };

  const resetBookForm = () => {
    setBookForm(initialBookForm);
    setEditingId('');
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({ nombre: '', email: '', password: '' });
    setEditingEmployeeId('');
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
    setAccountMenuOpen(false);
    setBooks([]);
    setEmployees([]);
    resetBookForm();
    resetEmployeeForm();
    setStatus('Sesión cerrada');
  };

  const loadBooks = async () => {
    try {
      const response = await fetch(BOOKS_URL, {
        headers: authHeaders
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
        }
        throw new Error(data.message || 'Error al cargar libros');
      }

      setBooks(data);
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const loadEmployees = async () => {
    if (!isAdmin) {
      setEmployees([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        headers: authHeaders
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar empleados');
      }

      setEmployees(data);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      loadBooks();
      if (user?.rol === 'admin') {
        loadEmployees();
      }
    }
  }, [token, user?.rol]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookChange = (event) => {
    const { name, value, type, checked } = event.target;
    setBookForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmployeeChange = (event) => {
    const { name, value } = event.target;
    setEmployeeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    if (authMode === 'register' && !loginForm.nombre) {
      setStatus('Para registrarte completa nombre, email y contraseña');
      return;
    }

    try {
      const endpoint = authMode === 'login' ? `${AUTH_URL}/login` : `${AUTH_URL}/register`;
      const payload =
        authMode === 'login'
          ? { email: loginForm.email, password: loginForm.password, rol: loginForm.rol }
          : loginForm;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo completar la operación');
      }

      if (authMode === 'register') {
        setStatus('Cuenta creada. Ahora inicia sesión.');
        setAuthMode('login');
        setLoginForm((prev) => ({ ...prev, nombre: '' }));
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAccountMenuOpen(false);
      setLoginForm({ nombre: '', email: '', password: '', rol: 'consumidor' });
      setStatus('Sesión iniciada correctamente');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleCreateOrUpdateBook = async (event) => {
    event.preventDefault();

    const payload = {
      titulo: bookForm.titulo.trim(),
      autor: bookForm.autor.trim(),
      genero: bookForm.genero.trim(),
      anioPublicacion: Number(bookForm.anioPublicacion),
      disponible: Boolean(bookForm.disponible)
    };

    try {
      const response = await fetch(editingId ? `${BOOKS_URL}/${editingId}` : BOOKS_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar el libro');
      }

      setStatus(editingId ? 'Libro actualizado correctamente' : 'Libro agregado correctamente');
      resetBookForm();
      loadBooks();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este libro?')) {
      return;
    }

    try {
      const response = await fetch(`${BOOKS_URL}/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo eliminar');
      }

      setStatus(data.message);
      loadBooks();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleCreateOrUpdateEmployee = async (event) => {
    event.preventDefault();

    if (!employeeForm.nombre || !employeeForm.email) {
      setStatus('Nombre y email del empleado son obligatorios');
      return;
    }

    if (!editingEmployeeId && !employeeForm.password) {
      setStatus('La contraseña es obligatoria para crear empleado');
      return;
    }

    const payload = {
      nombre: employeeForm.nombre.trim(),
      email: employeeForm.email.trim()
    };

    if (employeeForm.password) {
      payload.password = employeeForm.password;
    }

    try {
      const response = await fetch(
        editingEmployeeId ? `${API_BASE_URL}/employees/${editingEmployeeId}` : `${API_BASE_URL}/employees`,
        {
          method: editingEmployeeId ? 'PUT' : 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar el empleado');
      }

      setStatus(editingEmployeeId ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente');
      resetEmployeeForm();
      loadEmployees();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const startEditEmployee = (employee) => {
    setEditingEmployeeId(employee._id || employee.id);
    setEmployeeForm({
      nombre: employee.nombre,
      email: employee.email,
      password: ''
    });
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este empleado?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo eliminar empleado');
      }

      setStatus(data.message);
      if (editingEmployeeId === employeeId) {
        resetEmployeeForm();
      }
      loadEmployees();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const startEdit = (book) => {
    setEditingId(book._id);
    setBookForm({
      titulo: book.titulo,
      autor: book.autor,
      genero: book.genero,
      anioPublicacion: String(book.anioPublicacion),
      disponible: Boolean(book.disponible)
    });
  };

  return (
    <main className="container">
      {token ? (
        <>
          <header className="app-header">
            <div className="brand-box">
              <span className="brand-logo">📚</span>
              <div>
                <p className="brand-title">Libreria Santa</p>
                <p className="brand-subtitle">Gestión de libros y préstamos</p>
              </div>
            </div>
            <nav className="top-nav">
              <span>Inicio</span>
              <span>Catálogo</span>
              <div className="account-menu">
                <button
                  type="button"
                  className="account-trigger"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                >
                  Mi cuenta ▾
                </button>
                {accountMenuOpen ? (
                  <div className="account-dropdown">
                    <p className="account-name">{user?.nombre || 'Usuario'}</p>
                    <p className="account-role">Eres: {currentRoleLabel}</p>
                    <button className="secondary account-logout" type="button" onClick={logout}>
                      Cerrar sesión
                    </button>
                  </div>
                ) : null}
              </div>
            </nav>
          </header>

          <h1 className="page-title">Libreria Santa</h1>

          <section className="card hero-card">
            <div className="hero-content">
              <p className="hero-kicker">Plataforma editorial</p>
              <h2>Administra tu catálogo de libros de forma rápida y profesional</h2>
              <p>
                Mantén control de tus títulos, autores y disponibilidad en una interfaz moderna, adaptable y
                fácil de usar en cualquier dispositivo.
              </p>
              <div className="hero-stats">
                <article>
                  <strong>{totalBooks}</strong>
                  <span>Libros registrados</span>
                </article>
                <article>
                  <strong>{availableBooks}</strong>
                  <span>Disponibles</span>
                </article>
                <article>
                  <strong>{Math.max(totalBooks - availableBooks, 0)}</strong>
                  <span>No disponibles</span>
                </article>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {!token ? (
        <>
          <h1 className="page-title login-page-title">Libreria Santa</h1>
          <section className="card auth-card" id="login-card">
            <h2 className="section-title">{authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
            <form className="login-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' ? (
                <>
                  <label htmlFor="login-name">Nombre</label>
                  <input
                    id="login-name"
                    name="nombre"
                    type="text"
                    required
                    value={loginForm.nombre}
                    onChange={handleLoginChange}
                  />
                </>
              ) : null}

              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                value={loginForm.email}
                onChange={handleLoginChange}
              />

              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                value={loginForm.password}
                onChange={handleLoginChange}
              />

              <label htmlFor="login-role">Categoría</label>
              <select id="login-role" name="rol" value={loginForm.rol} onChange={handleLoginChange}>
                <option value="admin">Admin</option>
                <option value="empleado">Empleado</option>
                <option value="consumidor">Consumidor</option>
              </select>

              <div className="actions">
                <button type="submit">{authMode === 'login' ? 'Entrar' : 'Registrarme'}</button>
              </div>

              <p className="auth-hint">
                {authMode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setStatus('');
                  }}
                >
                  {authMode === 'login' ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                </button>
              </p>
            </form>
          </section>
        </>
      ) : (
        <>
          <section className="highlights-grid">
            <article className="mini-card">
              <h3>Gestión simple</h3>
              <p>Agrega o actualiza libros en segundos desde un solo formulario.</p>
            </article>
            <article className="mini-card">
              <h3>Control de estado</h3>
              <p>Visualiza fácilmente qué libros están disponibles para préstamo.</p>
            </article>
            <article className="mini-card">
              <h3>Tu rol: {currentRoleLabel}</h3>
              <p>
                {isAdmin
                  ? 'Tienes control total: libros y gestión de empleados.'
                  : isEmployee
                    ? 'Puedes crear y editar libros, pero no eliminarlos.'
                    : 'Solo puedes consultar libros del catálogo.'}
              </p>
            </article>
          </section>

          {canManageBooks ? (
            <section className="card panel-card">
              <h2 className="section-title">{editingId ? 'Editar libro' : 'Agregar libro'}</h2>
              <form onSubmit={handleCreateOrUpdateBook}>
                <label htmlFor="titulo">Título</label>
                <input id="titulo" name="titulo" required value={bookForm.titulo} onChange={handleBookChange} />

                <label htmlFor="autor">Autor</label>
                <input id="autor" name="autor" required value={bookForm.autor} onChange={handleBookChange} />

                <label htmlFor="genero">Género</label>
                <input id="genero" name="genero" required value={bookForm.genero} onChange={handleBookChange} />

                <label htmlFor="anioPublicacion">Año de publicación</label>
                <input
                  id="anioPublicacion"
                  name="anioPublicacion"
                  type="number"
                  min="1400"
                  required
                  value={bookForm.anioPublicacion}
                  onChange={handleBookChange}
                />

                <label className="check">
                  <input
                    id="disponible"
                    name="disponible"
                    type="checkbox"
                    checked={bookForm.disponible}
                    onChange={handleBookChange}
                  />
                  Disponible
                </label>

                <div className="actions">
                  <button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</button>
                  {editingId ? (
                    <button type="button" className="secondary" onClick={resetBookForm}>
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </form>
            </section>
          ) : (
            <section className="card panel-card notice-card">
              <h2 className="section-title">Modo consulta</h2>
              <p>Tu categoría es consumidor, por lo que solo puedes ver el catálogo de libros.</p>
            </section>
          )}

          {isAdmin ? (
            <section className="card panel-card">
              <h2 className="section-title">Gestión de empleados</h2>
              <form onSubmit={handleCreateOrUpdateEmployee}>
                <label htmlFor="empleado-nombre">Nombre</label>
                <input
                  id="empleado-nombre"
                  name="nombre"
                  required
                  value={employeeForm.nombre}
                  onChange={handleEmployeeChange}
                />

                <label htmlFor="empleado-email">Email</label>
                <input
                  id="empleado-email"
                  name="email"
                  type="email"
                  required
                  value={employeeForm.email}
                  onChange={handleEmployeeChange}
                />

                <label htmlFor="empleado-password">Contraseña {editingEmployeeId ? '(opcional)' : ''}</label>
                <input
                  id="empleado-password"
                  name="password"
                  type="password"
                  value={employeeForm.password}
                  onChange={handleEmployeeChange}
                />

                <div className="actions">
                  <button type="submit">{editingEmployeeId ? 'Actualizar empleado' : 'Crear empleado'}</button>
                  {editingEmployeeId ? (
                    <button type="button" className="secondary" onClick={resetEmployeeForm}>
                      Cancelar edición
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="table-wrapper employee-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="4">No hay empleados registrados.</td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr key={employee._id || employee.id}>
                          <td data-label="Nombre">{employee.nombre}</td>
                          <td data-label="Email">{employee.email}</td>
                          <td data-label="Rol">{roleLabels[employee.rol] || employee.rol}</td>
                          <td data-label="Acciones" className="actions-cell">
                            <button className="edit" onClick={() => startEditEmployee(employee)}>
                              Editar
                            </button>
                            <button
                              className="danger"
                              onClick={() => handleDeleteEmployee(employee._id || employee.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className="card panel-card table-card">
            <h2 className="section-title">Listado de libros</h2>
            <p id="status">{status}</p>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Género</th>
                    <th>Año</th>
                    <th>Disponible</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan="6">No hay libros registrados.</td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book._id}>
                        <td data-label="Título">{book.titulo}</td>
                        <td data-label="Autor">{book.autor}</td>
                        <td data-label="Género">{book.genero}</td>
                        <td data-label="Año">{book.anioPublicacion}</td>
                        <td data-label="Disponible">{book.disponible ? 'Sí' : 'No'}</td>
                        <td data-label="Acciones" className="actions-cell">
                          {canManageBooks ? (
                            <button className="edit" onClick={() => startEdit(book)}>
                              Editar
                            </button>
                          ) : null}
                          {canDeleteBooks ? (
                            <button className="danger" onClick={() => handleDeleteBook(book._id)}>
                              Eliminar
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {!token ? <p id="status">{status}</p> : null}
    </main>
  );
}

export default App;
