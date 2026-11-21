import { apiClient } from '../config/apiClient';
import type { EnrollmentConfigPayload, EnrollmentConfigResponse } from './types';

// El interceptor de apiClient devuelve `response.data`, no la AxiosResponse.
const unwrap = <T>(request: Promise<unknown>) => request as Promise<T>;

export const botEnrollmentService = {
  getConfig: () => unwrap<EnrollmentConfigResponse>(apiClient.get('/chat/enrollment-config')),

  saveConfig: (data: EnrollmentConfigPayload) => unwrap<EnrollmentConfigResponse>(apiClient.put('/chat/enrollment-config', data)),
};
