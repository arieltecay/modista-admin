import { apiClient } from './config/apiClient';

export const getChats = () => apiClient.get('/chat');
export const getMessages = (platform: string, platformId: string) => apiClient.get(`/chat/${platform}/${platformId}`);
export const sendMessage = (platform: string, platformId: string, body: string) => 
  apiClient.post(`/chat/${platform}/${platformId}/messages`, { body });

export const markAllAsRead = () => apiClient.post('/chat/read-all');
export const deleteMessage = (messageId: string) => apiClient.delete(`/chat/messages/${messageId}`);
export const clearChat = (platform: string, platformId: string) => apiClient.delete(`/chat/${platform}/${platformId}/clear`);

// WhatsApp Templates
export const getTemplates = () => apiClient.get('/notifications/whatsapp/templates');
/** Body Meta needs to create a template. */
export interface TemplatePayload {
  name: string;
  category: string;
  language: string;
  components: { type: string; text: string }[];
}

/** Test send. `languageCode` was already sent; the API defaults it to es_AR. */
export interface TestTemplatePayload {
  to: string;
  templateName: string;
  components: unknown[];
  languageCode?: string;
}

export const createTemplate = (data: TemplatePayload) => apiClient.post('/notifications/whatsapp/templates', data);
export const deleteTemplate = (name: string) => apiClient.delete(`/notifications/whatsapp/templates/${name}`);
export const sendTestTemplate = (data: TestTemplatePayload) =>
  apiClient.post('/notifications/whatsapp/templates/test', data);
