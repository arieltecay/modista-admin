import { apiClient } from './config/apiClient';

export interface Testimonial {
  _id: string;
  name: string;
  description: string;
  role?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const testimonialService = {
  /**
   * Obtiene todos los testimonios (para admin)
   */
  async getAll(): Promise<Testimonial[]> {
    return apiClient.get<Testimonial[]>('/testimonials/all');
  },

  /**
   * Crea un nuevo testimonio
   */
  async create(data: Partial<Testimonial>): Promise<Testimonial> {
    return apiClient.post<Testimonial>('/testimonials', data);
  },

  /**
   * Actualiza un testimonio
   */
  async update(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
    return apiClient.put<Testimonial>(`/testimonials/${id}`, data);
  },

  /**
   * Elimina un testimonio
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/testimonials/${id}`);
  }
};
