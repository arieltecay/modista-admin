import type { ReactNode } from 'react';

export interface SectionErrorBoundaryProps {
  children: ReactNode;
  /** Changing it clears a previous failure (e.g. when the tab is shown again). */
  resetKey?: string;
}

export interface SectionErrorBoundaryState {
  failed: boolean;
}
