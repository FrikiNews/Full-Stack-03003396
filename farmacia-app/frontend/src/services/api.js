const API_URL = 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || 'Error en solicitud';

    if (response.status === 401 && /token/i.test(message)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    throw new Error(message);
  }

  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  listMedicines: ({ page = 1, limit = 10, search = '', category = '' }) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (search) {
      params.set('search', search);
    }

    if (category) {
      params.set('category', category);
    }

    return request(`/medicines?${params.toString()}`);
  },
  getMedicine: (id) => request(`/medicines/${id}`),
  createMedicine: (payload) => request('/medicines', { method: 'POST', body: JSON.stringify(payload) }),
  updateMedicine: (id, payload) => request(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMedicine: (id) => request(`/medicines/${id}`, { method: 'DELETE' })
};
