import type { ReactNode } from 'react';

export interface LoadStateProps {
  status: 'loading' | 'ready' | 'error';
  /** Announced to screen readers while loading. */
  loadingLabel: string;
  errorMessage: string;
  isEmpty: boolean;
  emptyMessage: ReactNode;
  onRetry: () => void;
  children: ReactNode;
  /** Tailwind classes of each skeleton block (height, radius). */
  skeletonClass?: string;
  /** Layout of the skeleton blocks, e.g. the grid of the cards they stand for. */
  skeletonLayoutClass?: string;
}
