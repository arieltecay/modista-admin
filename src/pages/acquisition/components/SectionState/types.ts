import type { ReactNode } from 'react';

export interface SectionStateProps {
  title: string;
  isLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
  /** The last refresh failed but earlier data is still on screen. */
  isStale?: boolean;
  onRetry?: () => void;
}
