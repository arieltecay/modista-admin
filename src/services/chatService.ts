import { apiClient } from './config/apiClient';

export const getChats = () => apiClient.get('/chat');
export const getMessages = (platform: string, platformId: string) => apiClient.get(`/chat/${platform}/${platformId}`);
export const sendMessage = (platform: string, platformId: string, body: string) => 
  apiClient.post(`/chat/${platform}/${platformId}/messages`, { body });

export const deleteMessage = (messageId: string) => apiClient.delete(`/chat/messages/${messageId}`);
export const clearChat = (platform: string, platformId: string) => apiClient.delete(`/chat/${platform}/${platformId}/clear`);

// WhatsApp Templates
export const getTemplates = () => apiClient.get('/notifications/whatsapp/templates');
export const createTemplate = (data: any) => apiClient.post('/notifications/whatsapp/templates', data);
export const deleteTemplate = (name: string) => apiClient.delete(`/notifications/whatsapp/templates/${name}`);
export const sendTestTemplate = (data: { to: string; templateName: string; components: any[] }) => 
  apiClient.post('/notifications/whatsapp/templates/test', data);
