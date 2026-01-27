import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Issue API methods
export const issueAPI = {
  // Get all issues
  getAll: async (params) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  // Get single issue
  getById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  // Create new issue
  create: async (issueData) => {
    const response = await api.post('/issues', issueData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update issue (authority only)
  update: async (id, issueData) => {
    const response = await api.put(`/issues/${id}`, issueData);
    return response.data;
  },

  // Delete issue
  delete: async (id) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  },

  // Upvote issue
  upvote: async (id) => {
    const response = await api.put(`/issues/${id}/upvote`);
    return response.data;
  },

  // Get my issues
  getMyIssues: async () => {
    const response = await api.get('/issues/user/my-issues');
    return response.data;
  },

  // Upload completion image (authority only)
  uploadCompletionImage: async (id, formData) => {
    const response = await api.put(`/issues/${id}/completion-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Direct post method for auth
  post: async (url, data) => {
    const response = await api.post(url, data);
    return response;
  },
};

export default api;