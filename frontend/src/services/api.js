const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Squad APIs
export const squadAPI = {
  getAll: () => fetchAPI('/squads'),
  getById: (id) => fetchAPI(`/squads/${id}`),
  create: (data) => fetchAPI('/squads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/squads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/squads/${id}`, { method: 'DELETE' }),
};

// Player APIs
export const playerAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/players${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => fetchAPI(`/players/${id}`),
  create: (data) => fetchAPI('/players', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/players/${id}`, { method: 'DELETE' }),
  moveToSquad: (id, squadId) => fetchAPI(`/players/${id}/move`, {
    method: 'POST',
    body: JSON.stringify({ squad_id: squadId }),
  }),
};

// Application APIs
export const applicationAPI = {
  getAll: (status) => fetchAPI(`/applications${status ? `?status=${status}` : ''}`),
  create: (data) => fetchAPI('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => fetchAPI(`/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  delete: (id) => fetchAPI(`/applications/${id}`, { method: 'DELETE' }),
};

// Health check
export const healthCheck = () => fetchAPI('/health');

// Initialize database
export const initDatabase = () => fetchAPI('/init', { method: 'POST' });

const apiClient = { squadAPI, playerAPI, applicationAPI, healthCheck, initDatabase };

export default apiClient;