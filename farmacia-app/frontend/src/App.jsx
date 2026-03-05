import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MedicineDetailPage from './pages/MedicineDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { api } from './services/api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      setUser(JSON.parse(userString));
    }
  }, []);

  async function handleAuth(payload) {
    const endpoint = payload.mode === 'register' ? 'register' : 'login';
    const authPayload =
      endpoint === 'register'
        ? {
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role
          }
        : {
            email: payload.email,
            password: payload.password
          };

    const data = await api[endpoint](authPayload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage onLogin={handleAuth} /> : <Navigate to="/" replace />} />

      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <DashboardPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medicines/:id"
        element={
          <ProtectedRoute user={user}>
            <MedicineDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
