// API Configuration
export const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || (import.meta.env.PROD ? '/_/backend' : 'http://localhost:8001');

console.log('API Base URL:', API_BASE_URL);
