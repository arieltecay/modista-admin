import axios from 'axios';
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

export const exportWorkshopInscriptions = async (
  workshopId: string,
  paymentStatusFilter: 'all' | 'paid' | 'pending' | 'partial' = 'all',
  search?: string,
  turnoFilter?: string
): Promise<void> => {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || '';
  const downloadClient = axios.create({
    baseURL: `${API_URL}/api`,
  });

  try {
    const response = await downloadClient.get(`/workshop-inscriptions/${workshopId}/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { paymentStatusFilter, search, turnoFilter },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers['content-disposition'];
    let filename = `taller_${workshopId}.xlsx`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    throw new Error('No se pudo descargar el archivo.');
  }
};
