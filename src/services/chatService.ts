import { apiClient } from './config/apiClient';

export const getChats = () => apiClient.get('/chat');
export const getMessages = (platform: string, platformId: string) => apiClient.get(`/chat/${platform}/${platformId}`);
export const sendMessage = (platform: string, platformId: string, body: string) => 
  apiClient.post(`/chat/${platform}/${platformId}/messages`, { body });
