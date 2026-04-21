import { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClass: string;
  loading: boolean;
}

export interface InscriptionStats {
  total: number;
  paid: number;
  pending: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
