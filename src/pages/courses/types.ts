import { ReactNode } from 'react';
import { Course } from '@/services/types';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClass: string;
  loading: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface CoursesStats {
  total: number;
}

export interface DeleteModalState {
  isOpen: boolean;
  courseId: string | null;
  courseTitle: string;
}
