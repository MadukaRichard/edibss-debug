import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '') || 'http://localhost:5003';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medirun_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medirun_token');
      localStorage.removeItem('medirun_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// For multipart/form-data requests (file uploads). We must NOT send the
// instance's default 'application/json' header, or the browser can't attach
// its own multipart boundary and the server won't be able to parse the file.
export const apiUpload = (url, formData) =>
  api.post(url, formData, { headers: { 'Content-Type': undefined } });

export default api;
