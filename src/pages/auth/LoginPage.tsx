import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import { loginUser } from '@/services/auth/authService';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (credentials: any) => {
    setLoading(true);
    setError(null);
    console.log('Intentando login con:', { ...credentials, password: '***' });

    try {
      const response = await loginUser(credentials);
      console.log('Respuesta de login exitosa:', response);
      login(response.token, response.user);
      toast.success('¡Inicio de sesión exitoso!');

      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('No tienes permisos de administrador');
      }
    } catch (error: any) {
      console.error('Error capturado en LoginPage:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default LoginPage;
