import { apiClient } from '../config/apiClient';

interface GetTurnosOptions {
  includeBlocked?: boolean;
}

export const getTurnosByCourse = (courseId: string, options: GetTurnosOptions = {}): Promise<any> => {
  const query = options.includeBlocked ? '?admin=true' : '';
  return apiClient.get(`/turnos/course/${courseId}${query}`);
};

export const createTurno = (turnoData: any) =>
  apiClient.post('/turnos', turnoData);

export const updateTurno = (id: string, turnoData: any) =>
  apiClient.patch(`/turnos/${id}`, turnoData);

export const deleteTurno = (id: string) =>
  apiClient.delete(`/turnos/${id}`);
