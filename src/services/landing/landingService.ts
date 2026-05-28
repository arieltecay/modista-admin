import { apiClient } from '../config/apiClient';
import { LandingPage, CreateLandingPageData, ApiResponse, PaginatedResponse, PaginationParams } from '../types';

export const createLandingPage = (data: CreateLandingPageData): Promise<ApiResponse<LandingPage>> =>
    apiClient.post('/landings', data);

export const getLandingPages = (params: PaginationParams): Promise<PaginatedResponse<LandingPage>> =>
    apiClient.get('/landings', { params });

export const getLandingPageById = (id: string): Promise<ApiResponse<LandingPage>> =>
    apiClient.get(`/landings/${id}`);

export const updateLandingPage = (id: string, data: Partial<CreateLandingPageData>): Promise<ApiResponse<LandingPage>> =>
    apiClient.patch(`/landings/${id}`, data);

export const deleteLandingPage = (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/landings/${id}`);
