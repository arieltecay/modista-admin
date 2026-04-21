import { ReactNode } from 'react';

export interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: Array<'admin' | 'user'>;
}
