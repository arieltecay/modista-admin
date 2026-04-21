export type AuthMode = 'login' | 'register';

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  role?: 'user' | 'admin';
}

export interface AuthFormErrors {
  email?: string | null;
  password?: string | null;
  name?: string | null;
}

export interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (data: AuthFormData) => void;
  loading: boolean;
  error: string | null;
}
