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

export const companyService = {
  async createCompany(companyData) {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  async getCompany(companyId) {
    const response = await api.get(`/companies/${companyId}`);
    return response.data;
  },

  async getUserCompany() {
    const response = await api.get('/companies/my/company');
    return response.data;
  },

  async updateCompany(companyId, companyData) {
    const response = await api.put(`/companies/${companyId}`, companyData);
    return response.data;
  },

  async uploadLogo(companyId, file) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post(`/companies/${companyId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async generateQRCode(companyId) {
    const response = await api.post(`/companies/${companyId}/qr-code`);
    return response.data;
  },

  async getMenuLink(companyId) {
    const response = await api.get(`/companies/${companyId}/menu-link`);
    return response.data;
  },
}; 