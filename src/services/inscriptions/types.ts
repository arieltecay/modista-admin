/**
 * @file Tipos de Inscripciones de Talleres
 * @module services/inscriptions/types
 */

export interface WorkshopInscriptionItem {
    _id: string;
    nombre: string;
    apellido: string;
    totalPaid: number;
    isFullPayment: boolean;
}

export interface TurnoGroup {
    turnoId: string;
    turnoLabel: string;
    capacity: number;
    enrolled: number;
    inscriptions: WorkshopInscriptionItem[];
}

export interface WorkshopSummary {
    totalPaidCount: number;
    partialPaidCount: number;
    totalInscriptions: number;
}

export interface WorkshopDetailsResponse {
    workshopTitle: string;
    workshopPrice: number;
    summary: WorkshopSummary;
    turnoGroups: TurnoGroup[];
}

export interface TurnoInfo {
    _id: string;
    courseId: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    cupoMaximo: number;
    cuposInscriptos: number;
    isActive: boolean;
    isBlocked: boolean;
}

export interface WorkshopInscriptionData {
    _id: string;
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
    courseId: string;
    courseTitle: string;
    coursePrice: number;
    paymentStatus: string;
    turnoId: TurnoInfo;
    totalPaid: number;
    isReserved: boolean;
    fechaInscripcion: string;
    depositDate?: string;
}

export interface WorkshopInscriptionsPaginatedResponse {
    data: WorkshopInscriptionData[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export interface Payment {
  _id?: string;
  date: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface PaymentHistoryData {
  history: Payment[];
  totalPaid: number;
  coursePrice: number;
}

export interface PaymentHistoryResponse {
  data: PaymentHistoryData;
  success: boolean;
}
