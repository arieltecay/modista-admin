import { apiClient } from '../config/apiClient';
import { Tariff, AvailableTariffMeta, TariffFormData } from './types';

export const tariffService = {
  async getAllTariffsMeta(): Promise<AvailableTariffMeta[]> {
    return apiClient.get('/tariffs/admin/all');
  },
  
  async getTariffById(id: string): Promise<Tariff> {
    return apiClient.get(`/tariffs/${id}`);
  },
  
  async createTariff(data: TariffFormData): Promise<Tariff> {
    return apiClient.post('/tariffs', data);
  },
  
  async updateTariff(id: string, data: Partial<TariffFormData>): Promise<Tariff> {
    return apiClient.put(`/tariffs/${id}`, data);
  },
  
  async deleteTariff(id: string): Promise<void> {
    await apiClient.delete(`/tariffs/${id}`);
  },

  async duplicateTariff(id: string): Promise<Tariff> {
    return apiClient.post(`/tariffs/${id}/duplicate`);
  }
};
