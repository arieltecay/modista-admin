import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const getChats = () => api.get('/chat');
export const getMessages = (platform: string, platformId: string) => api.get(`/chat/${platform}/${platformId}`);
export const sendMessage = (platform: string, platformId: string, body: string) => 
  api.post(`/chat/${platform}/${platformId}/messages`, { body });
