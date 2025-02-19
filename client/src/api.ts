// client/src/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', 
});

// Utilisation d’un intercepteur pour ajouter le token présent dans le cookie aux requêtes
API.interceptors.request.use((config) => {
  const token = Cookies.get('token'); 
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;