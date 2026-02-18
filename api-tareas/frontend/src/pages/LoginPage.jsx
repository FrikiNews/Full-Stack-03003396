import { useState } from 'react';
import { api } from '../services/api';

function LoginPage({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = isRegister
        ? await api.register(form)
        : await api.login({ email: form.email, password: form.password });

      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="screen-center">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>

        {isRegister && (
          <label>
            Nombre
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        )}

        <label>
          Correo electrónico
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Contraseña
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Enviando...' : isRegister ? 'Registrarme' : 'Entrar'}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setIsRegister((prev) => !prev);
            setError('');
          }}
        >
          {isRegister ? 'Ya tengo cuenta' : 'No tengo cuenta'}
        </button>
      </form>
    </main>
  );
}

export default LoginPage;
