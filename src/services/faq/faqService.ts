import { apiClient } from '../config/apiClient';
import { FAQ, FAQFormData } from '../../pages/faq/types';

export const faqService = {
  async getAllFAQs(): Promise<FAQ[]> {
    return apiClient.get('/faq');
  },
  async getActiveFAQs(): Promise<FAQ[]> {
    return apiClient.get('/faq/active');
  },
  async createFAQ(data: FAQFormData): Promise<FAQ> {
    return apiClient.post('/faq', data);
  },
  async updateFAQ(id: string, data: Partial<FAQFormData>): Promise<FAQ> {
    return apiClient.put(`/faq/${id}`, data);
  },
  async deleteFAQ(id: string): Promise<void> {
    await apiClient.delete(`/faq/${id}`);
  }
};
