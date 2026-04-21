import { apiClient } from '../config/apiClient';
import type { RegisterUserData, LoginCredentials, AuthResponse } from '../types';

export const registerUser = (userData: RegisterUserData): Promise<AuthResponse> =>
    apiClient.post('/auth/register', userData);

export const loginUser = (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiClient.post('/auth/login', credentials);
