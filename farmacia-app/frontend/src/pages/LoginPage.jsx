import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await onLogin({ ...formData, mode: isRegister ? 'register' : 'login' });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="page-center">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Crear cuenta de farmacia' : 'Iniciar sesión'}</h2>

        {isRegister && (
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre completo"
            required
          />
        )}

        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Correo" required />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Contraseña"
          required
        />

        {isRegister && (
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="employee">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit">{isRegister ? 'Registrarse' : 'Entrar'}</button>
        <button type="button" className="secondary" onClick={() => setIsRegister((prev) => !prev)}>
          {isRegister ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
