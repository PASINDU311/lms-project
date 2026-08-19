import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔔 Notification API Services
export const getNotifications = () => API.get('/notifications');
export const markNotificationAsRead = (id: number) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.put('/notifications/read-all');

export default API;