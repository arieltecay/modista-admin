import { ReactNode } from 'react';

export interface NavItem {
  name: string;
  href: string;
  icon: any; // Using any for heroicons components
  active?: boolean;
}

export interface AdminSidebarProps {
  onClose?: () => void;
}
