import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase credentials not configured. Check environment variables.');
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Squad APIs
export const squadAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('squads')
      .select('*, players(*)')
      .order('name');
    if (error) throw new Error(error.message);
    return data || [];
  },
  getById: async (id) => {
    const { data, error } = await supabase
      .from('squads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  create: async (data) => {
    const { data: result, error } = await supabase
      .from('squads')
      .insert([data])
      .select();
    if (error) throw new Error(error.message);
    return result[0];
  },
  update: async (id, data) => {
    const { data: result, error } = await supabase
      .from('squads')
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    return result[0];
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('squads')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// Player APIs
const buildPlayerPayload = (data, useStatsJson = false) => {
  const payload = {
    first_name: data.first_name,
    last_name: data.last_name,
    age: data.age || null,
    position: data.position,
    squad_id: data.squad_id,
    quote: data.quote || null,
  };

  if (data.image_url) {
    payload.image_url = data.image_url;
  }
  if (data.is_spotlight !== undefined) {
    payload.is_spotlight = data.is_spotlight;
  }

  if (useStatsJson) {
    payload.stats = {
      goals: data.stats_goals || 0,
      assists: data.stats_assists || 0,
      matches: data.stats_matches || 0,
    };
  } else {
    payload.stats_goals = data.stats_goals || 0;
    payload.stats_assists = data.stats_assists || 0;
    payload.stats_matches = data.stats_matches || 0;
  }

  return payload;
};

const normalizePlayerApiError = (error) => {
  if (!error || !error.message) return false;
  const msg = error.message.toLowerCase();
  const missingColumns = ['stats_goals', 'stats_assists', 'stats_matches', 'image_url', 'is_spotlight'];
  return missingColumns.some((col) => msg.includes(col));
};

export const playerAPI = {
  getAll: async (params = {}) => {
    let query = supabase.from('players').select('*');
    if (params.squad_id) {
      query = query.eq('squad_id', params.squad_id);
    }
    if (params.position) {
      query = query.eq('position', params.position);
    }
    if (params.is_spotlight !== undefined) {
      query = query.eq('is_spotlight', params.is_spotlight);
    }
    if (params.limit) {
      query = query.limit(params.limit);
    }
    const { data, error } = await query.order('id', { ascending: true });
    if (error) {
      const errMsg = (error.message || '').toLowerCase();

      // fallback for older schemas without is_spotlight
      if (params.is_spotlight !== undefined && (errMsg.includes('is_spotlight') || errMsg.includes('unknown column') || errMsg.includes('column not found') || normalizePlayerApiError(error))) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('players')
          .select('*')
          .limit(params.limit || 4)
          .order('id', { ascending: true });
        if (fallbackError) throw new Error(fallbackError.message);
        return fallbackData || [];
      }
      throw new Error(error.message);
    }
    return data || [];
  },
  getById: async (id) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  create: async (data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      age: data.age || null,
      position: data.position,
      squad_id: data.squad_id,
      quote: data.quote || null,
      stats_goals: data.stats_goals || 0,
      stats_assists: data.stats_assists || 0,
      stats_matches: data.stats_matches || 0,
    };
    if (data.image_url) payload.image_url = data.image_url;
    if (data.is_spotlight !== undefined) payload.is_spotlight = data.is_spotlight;

    let { data: result, error } = await supabase
      .from('players')
      .insert([payload])
      .select();

    if (error) {
      if (normalizePlayerApiError(error)) {
        const retryPayload = buildPlayerPayload(data, true);
        delete retryPayload.image_url;
        delete retryPayload.is_spotlight;

        const { data: retryResult, error: retryError } = await supabase
          .from('players')
          .insert([retryPayload])
          .select();
        if (retryError) throw new Error(retryError.message);
        return retryResult[0];
      }

      throw new Error(error.message);
    }
    return result[0];
  },
  update: async (id, data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      age: data.age || null,
      position: data.position,
      squad_id: data.squad_id,
      quote: data.quote || null,
      stats_goals: data.stats_goals || 0,
      stats_assists: data.stats_assists || 0,
      stats_matches: data.stats_matches || 0,
    };
    if (data.image_url) payload.image_url = data.image_url;
    if (data.is_spotlight !== undefined) payload.is_spotlight = data.is_spotlight;

    let { data: result, error } = await supabase
      .from('players')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      if (normalizePlayerApiError(error)) {
        const retryPayload = buildPlayerPayload(data, true);
        delete retryPayload.image_url;
        delete retryPayload.is_spotlight;

        const { data: retryResult, error: retryError } = await supabase
          .from('players')
          .update(retryPayload)
          .eq('id', id)
          .select();
        if (retryError) throw new Error(retryError.message);
        return retryResult[0];
      }

      throw new Error(error.message);
    }
    return result[0];
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },
  moveToSquad: async (id, squadId) => {
    const { data: result, error } = await supabase
      .from('players')
      .update({ squad_id: squadId })
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    return result[0];
  },
};

// Application APIs
export const applicationAPI = {
  getAll: async (status) => {
    let query = supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },
  create: async (data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      position: data.position,
      email: data.email,
      phone: data.phone || null,
      previous_club: data.previous_club || null,
      message: data.message || null
    };

    let { data: result, error } = await supabase
      .from('applications')
      .insert([payload])
      .select();

    if (error) {
      const src = error.message.toLowerCase();
      const isMissingColumn = ['previous_club', 'message'].some((column) => src.includes(column));
      if (isMissingColumn) {
        const retryPayload = { ...payload };
        delete retryPayload.previous_club;
        delete retryPayload.message;

        const { data: retryResult, error: retryError } = await supabase
          .from('applications')
          .insert([retryPayload])
          .select();

        if (retryError) throw new Error(retryError.message);
        return retryResult[0];
      }
      throw new Error(error.message);
    }

    return result[0];
  },
  updateStatus: async (id, status) => {
    const { data: result, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    return result[0];
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// Initialize database - no longer needed with Supabase
export const initDatabase = async () => {
  console.log('Database already initialized on Supabase');
  return { success: true };
};

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

const combineUrl = (base, path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base.replace(/\/$/, '')}${p}`;
};

const parseResponse = async (response) => {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' ? (data.error || data.message) : data;
    throw new Error(message || `Server returned ${response.status} ${response.statusText}`);
  }

  return data;
};

const apiFetch = async (path, options = {}) => {
  const candidates = [];
  if (API_BASE_URL) candidates.push(API_BASE_URL);
  // macOS may reserve 5000 for AirPlay/AirTunes; prioritize 5001 first for local Flask backend
  candidates.push('http://localhost:5001');
  candidates.push('http://localhost:5000');

  const token = localStorage.getItem('eastleigh_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError = null;
  for (const base of [...new Set(candidates)]) {
    const url = combineUrl(base, path);
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.ok || [403, 404, 500].includes(response.status) === false) {
        return parseResponse(response);
      }
      // if 403/404 from one of the endpoints, try next fallback before throwing
      if (response.ok === false && (response.status === 403 || response.status === 404)) {
        try {
          const fallbackData = await parseResponse(response);
          return fallbackData;
        } catch (err) {
          lastError = err;
          continue;
        }
      }
      return parseResponse(response);
    } catch (err) {
      lastError = err;
      // try next host
      continue;
    }
  }

  throw lastError || new Error('Could not connect to API');
};

// Admin APIs
export const adminAPI = {
  signup: async ({ username, email, password }) => {
    return await apiFetch('/api/admin/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
  },
  login: async ({ email, password }) => {
    return await apiFetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },
  exists: async () => {
    try {
      const data = await apiFetch('/api/admin/exists');
      return !!data.exists;
    } catch (err) {
      if (err.message.toLowerCase().includes('403') || err.message.toLowerCase().includes('404')) {
        return false;
      }
      throw err;
    }
  },
  resetPassword: async (email) => {
    return await apiFetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  },
  confirmReset: async ({ token, new_password }) => {
    return await apiFetch('/api/admin/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    });
  },
  list: async () => {
    return await apiFetch('/api/admin/list');
  },
  delete: async (id) => {
    return await apiFetch(`/api/admin/${id}`, { method: 'DELETE' });
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const { error } = await supabase.from('squads').select('count');
    if (error) throw error;
    return { status: 'ok' };
  } catch (error) {
    throw new Error('Database health check failed: ' + error.message);
  }
};

const apiClient = { squadAPI, playerAPI, applicationAPI, adminAPI, healthCheck, initDatabase };

export default apiClient;