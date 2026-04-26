import axios from 'axios';
import { apiClient } from '../config/apiClient';
import type {
    Inscription,
    CreateInscriptionData,
    PaginatedResponse,
    InscriptionsCount,
} from '../types';
import type { 
    PaymentHistoryResponse,
    PaymentHistoryData 
} from './types';

export type {
    Inscription,
    CreateInscriptionData,
    PaginatedResponse,
    InscriptionsCount,
    PaymentHistoryResponse,
    PaymentHistoryData
};

export const createInscription = (formData: CreateInscriptionData): Promise<Inscription> =>
    apiClient.post('/inscriptions', formData);

export interface GetInscriptionsParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    paymentStatusFilter?: 'all' | 'paid' | 'pending';
    courseFilter?: string;
    turnoFilter?: string;
    excludeWorkshops?: boolean;
}

export const getInscriptions = (params: GetInscriptionsParams): Promise<PaginatedResponse<Inscription>> => {
    const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder,
        search,
        paymentStatusFilter = 'all',
        courseFilter,
        turnoFilter,
        excludeWorkshops = false
    } = params;

    return apiClient.get('/inscriptions', {
        params: {
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            paymentStatusFilter,
            courseFilter,
            turnoFilter,
            excludeWorkshops: excludeWorkshops ? 'true' : 'false'
        },
    });
};

export const getInscriptionsCount = (excludeWorkshops?: boolean): Promise<InscriptionsCount> =>
    apiClient.get('/inscriptions/count', {
        params: { excludeWorkshops: excludeWorkshops ? 'true' : 'false' }
    });

export const updateInscriptionPaymentStatus = (
    inscriptionId: string,
    paymentStatus: 'pending' | 'paid'
): Promise<Inscription> =>
    apiClient.patch(`/inscriptions/${inscriptionId}/payment-status`, {
        paymentStatus
    });

export const updateInscriptionDeposit = (
    inscriptionId: string,
    depositAmount: number
): Promise<Inscription> =>
    apiClient.patch(`/inscriptions/${inscriptionId}/deposit`, {
        depositAmount
    });

export const addPayment = (
    inscriptionId: string,
    paymentData: { amount: number; paymentMethod?: string; notes?: string }
): Promise<Inscription> => 
    apiClient.post(`/inscriptions/${inscriptionId}/payments`, paymentData);

export const getPaymentHistory = (inscriptionId: string): Promise<PaymentHistoryResponse> =>
    apiClient.get(`/inscriptions/${inscriptionId}/payments`);

export const deletePayment = (inscriptionId: string, paymentId: string): Promise<PaymentHistoryResponse> =>
    apiClient.delete(`/inscriptions/${inscriptionId}/payments/${paymentId}`);

export const exportInscriptions = async (
    paymentStatusFilter: 'all' | 'paid' | 'pending' = 'all',
    search?: string,
    courseFilter?: string,
    excludeWorkshops?: boolean
): Promise<void> => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '';
    const downloadClient = axios.create({
        baseURL: `${API_URL}/api`,
    });

    try {
        const response = await downloadClient.get('/inscriptions/export', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { paymentStatusFilter, search, courseFilter, excludeWorkshops: excludeWorkshops ? 'true' : 'false' },
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'inscripciones.xlsx';

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
        if (error.response?.data?.type === 'application/json') {
            const errorJson: any = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(JSON.parse(result));
                };
                reader.readAsText(error.response.data);
            });
            throw new Error(errorJson.message || 'Error al exportar.');
        }
        throw new Error('No se pudo descargar el archivo. Verifica tu conexión y permisos.');
    }
};
