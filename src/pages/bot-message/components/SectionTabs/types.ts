import type { ReactNode } from 'react';

export interface SectionTab<T extends string> {
  id: T;
  label: string;
  icon: ReactNode;
}

export interface SectionTabsProps<T extends string> {
  tabs: SectionTab<T>[];
  active: T;
  onChange: (id: T) => void;
}
