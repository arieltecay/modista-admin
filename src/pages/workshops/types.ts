export interface WorkshopCourse {
  _id: string;
  uuid?: string;
  id?: string;
  title: string;
  courseId?: string;
  isPresencial?: boolean;
  price: number;
  lastMonthlyClosureDate?: string;
}

export interface Payment {
  _id?: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  notes?: string;
}

export interface Turno {
  _id: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
  cuposInscriptos: number;
  courseId: string;
  isBlocked: boolean;
  fecha?: string;
}

export interface NewTurno {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
  courseId: string;
}

export interface WorkshopInscription {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
  coursePrice: number;
  depositAmount: number;
  totalPaid: number;
  depositDate?: string;
  isReserved: boolean;
  fechaInscripcion: string;
  turnoId: string | Turno;
  courseTitle: string;
  paymentHistory?: Payment[];
}

export interface WorkshopSortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
