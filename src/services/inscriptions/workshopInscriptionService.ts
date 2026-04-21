import { apiClient } from '../config/apiClient';
import { WorkshopDetailsResponse, WorkshopInscriptionData } from './types';
import { PaginatedResponse } from '../types';

export const getWorkshopInscriptions = async (workshopId: string, params: any = {}): Promise<PaginatedResponse<WorkshopInscriptionData>> => {
  const { page = 1, limit = 10, sortBy, sortOrder, search, paymentStatusFilter = 'all', turnoFilter } = params;
  return apiClient.get(`/workshop-inscriptions/${workshopId}`, {
    params: { page, limit, sortBy, sortOrder, search, paymentStatusFilter, turnoFilter }
  });
};

export const getWorkshopDetails = async (workshopId: string): Promise<WorkshopDetailsResponse> =>
  apiClient.get(`/workshop-inscriptions/${workshopId}/details`);

export const updateInscriptionSchedule = async (inscriptionId: string, newTurnoId: string): Promise<WorkshopInscriptionData> =>
  apiClient.put(`/workshop-inscriptions/${inscriptionId}/schedule`, { newTurnoId });

export const getAvailableTurnosForInscription = async (inscriptionId: string): Promise<any[]> =>
  apiClient.get(`/workshop-inscriptions/inscription/${inscriptionId}/available-turnos`);

export const deleteWorkshopInscription = async (inscriptionId: string): Promise<void> =>
  apiClient.delete(`/workshop-inscriptions/workshop/${inscriptionId}`);
