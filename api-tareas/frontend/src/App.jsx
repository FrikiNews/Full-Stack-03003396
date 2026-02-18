import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './services/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await api.me();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  if (loading) {
    return <div className="screen-center">Cargando...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/" replace />
            : <LoginPage onAuthSuccess={setUser} />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <DashboardPage user={user} onLogout={() => setUser(null)} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
