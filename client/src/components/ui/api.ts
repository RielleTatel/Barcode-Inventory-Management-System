import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  // Inject Access Token from Memory (we will inject this via a closure or setup function usually, 
  // but for simplicity, let's assume we pass it or the interceptor is set up inside the component tree.
  // Ideally, you attach the token in the component or use a specialized hook.)
  // *See note below for best practice implementation*
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Browser automatically sends the 'refresh_token' cookie here!
        const { data } = await api.post('/accounts/refresh/');
        
        // Update the header for the retry
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        
        // You might need to update React Context here too, typically via an event or callback
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;