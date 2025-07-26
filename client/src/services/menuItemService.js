import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const menuItemService = {
  async createMenuItem(menuItemData) {
    const response = await api.post('/menu-items', menuItemData);
    return response.data;
  },

  async getMenuItems(companyId) {
    const response = await api.get(`/menu-items?company_id=${companyId}`);
    return response.data;
  },

  async getMenuItem(menuItemId) {
    const response = await api.get(`/menu-items/${menuItemId}`);
    return response.data;
  },

  async updateMenuItem(menuItemId, menuItemData) {
    const response = await api.put(`/menu-items/${menuItemId}`, menuItemData);
    return response.data;
  },

  async deleteMenuItem(menuItemId) {
    const response = await api.delete(`/menu-items/${menuItemId}`);
    return response.data;
  },

  async uploadImage(menuItemId, file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/menu-items/${menuItemId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 