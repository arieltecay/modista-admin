import React from 'react';

export interface TurnoData {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface Inscription {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  courseTitle?: string;
  turnoId?: TurnoData | string;
  coursePrice?: number;
  depositAmount?: number;
  depositDate?: string;
  paymentStatus: 'paid' | 'pending';
  fechaInscripcion: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface SortableHeaderProps {
  children: React.ReactNode;
  name: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export interface InscriptionsTableDesktopProps {
  inscriptions: Inscription[];
  loading: boolean;
  handlePaymentStatusUpdate: (id: string, status: 'paid' | 'pending') => void;
  sortConfig: SortConfig;
  handleSort: (key: string) => void;
  handleSendCourseEmail: (inscription: Inscription) => void;
  showDepositFeature?: boolean;
  onDepositClick: (inscription: Inscription) => void;
  hideCourseTitle?: boolean;
}

export interface InscriptionsListMobileProps {
  inscriptions: Inscription[];
  loading: boolean;
  handlePaymentStatusUpdate: (id: string, status: 'paid' | 'pending') => void;
  handleSendCourseEmail: (inscription: Inscription) => void;
  showDepositFeature?: boolean;
  onDepositClick: (inscription: Inscription) => void;
  hideCourseTitle?: boolean;
}
