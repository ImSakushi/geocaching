// src/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // adapte l'URL si nécessaire
});

// Intercepteur pour ajouter le token JWT aux requêtes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;