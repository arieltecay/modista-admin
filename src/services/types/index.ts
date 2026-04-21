/**
 * @file Tipos e Interfaces compartidas para todos los servicios
 * @module services/types
 */

export * from '../courses/types';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Inscription {
    id?: string;
    _id?: string;
    courseId?: string; // UUID del curso
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    courseTitle: string;
    coursePrice?: number;
    courseDeeplink?: string;
    courseShortDescription?: string;
    paymentStatus: 'pending' | 'paid';
    dateYear?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    totalPages: number;
    currentPage: number;
    total: number;
}

export interface InscriptionsCount {
    total: number;
    paid: number;
    pending: number;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface InscriptionFilters extends PaginationParams {
    paymentStatusFilter?: 'all' | 'paid' | 'pending';
    courseFilter?: string;
}

export interface RegisterUserData {
    email: string;
    password: string;
    name: string;
    role?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface CreateInscriptionData {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    courseTitle: string;
    coursePrice?: number;
    courseDeeplink?: string;
    courseShortDescription?: string;
    dateYear?: number;
}

export interface InscriptionEmailData {
    email: string;
    nombre: string;
    apellido: string;
    courseTitle: string;
    coursePrice?: number;
    courseDeeplink?: string;
    courseShortDescription?: string;
    dateYear?: number;
}

export interface EmailPayload {
    to: string;
    subject: string;
    templateName: string;
    data: Record<string, any>;
}
