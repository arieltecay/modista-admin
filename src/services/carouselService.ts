import { apiClient } from './config/apiClient';
import { CarouselSlide, CarouselSlideFormData } from '../pages/carousel/types';

export const carouselService = {
  async getAllSlides(): Promise<CarouselSlide[]> {
    return apiClient.get('/carousel');
  },
  async getActiveSlides(): Promise<CarouselSlide[]> {
    return apiClient.get('/carousel/active');
  },
  async createSlide(data: CarouselSlideFormData): Promise<CarouselSlide> {
    return apiClient.post('/carousel', data);
  },
  async updateSlide(id: string, data: Partial<CarouselSlideFormData>): Promise<CarouselSlide> {
    return apiClient.patch(`/carousel/${id}`, data);
  },
  async deleteSlide(id: string): Promise<void> {
    await apiClient.delete(`/carousel/${id}`);
  },
  async reorderSlides(items: { slideId: string; order: number }[]): Promise<void> {
    await apiClient.post('/carousel/reorder', items);
  }
};
