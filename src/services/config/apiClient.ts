/**
 * @file Configuración centralizada del cliente HTTP Axios
 * @module services/config/apiClient
 */

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    <T = any>(response: AxiosResponse<T>): T => {
        const data = response.data;
        return normalizeResponseData(data);
    },
    (error: AxiosError<{ message?: string }>) => {
        if (error.response?.data?.message) {
            return Promise.reject(new Error(error.response.data.message));
        }
        return Promise.reject(error);
    }
);

const normalizeResponseData = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(item => normalizeResponseData(item));
    } else if (data !== null && typeof data === 'object') {
        if (data.uuid) {
            data.id = data.uuid;
        }
        
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (typeof data[key] === 'object' && data[key] !== null) {
                    data[key] = normalizeResponseData(data[key]);
                }
            }
        }
    }
    return data;
};
