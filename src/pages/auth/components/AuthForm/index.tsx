import React, { useState, ChangeEvent, FormEvent } from 'react';
import { AuthFormProps, AuthFormData, AuthFormErrors } from './types';

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });

  const [errors, setErrors] = useState<AuthFormErrors>({});

  const validateEmail = (email: string): boolean => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del email no es válido.';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (mode === 'register') {
      if (!formData.name?.trim()) {
        newErrors.name = 'El nombre es obligatorio.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof AuthFormErrors]) {
      setErrors({ ...errors, [name as keyof AuthFormErrors]: null });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData: AuthFormData = mode === 'login'
      ? { email: formData.email.trim(), password: formData.password.trim() }
      : { email: formData.email.trim(), password: formData.password.trim(), name: formData.name?.trim(), role: formData.role };

    onSubmit(submitData);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {mode === 'login' ? 'Iniciar Sesión Admin' : 'Crear Cuenta Admin'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="tu@email.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tu contraseña"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 focus:outline-none transition-colors"
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
