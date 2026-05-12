import React from 'react';
import { RocketLaunchIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute -inset-4 bg-indigo-100 rounded-full blur-2xl opacity-50 animate-pulse" />
        <RocketLaunchIcon className="w-24 h-24 text-indigo-600 relative z-10" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight flex items-center justify-center gap-3">
          Dashboard <SparklesIcon className="w-8 h-8 text-yellow-500" />
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Estamos construyendo algo <span className="text-indigo-600 font-bold italic underline decoration-indigo-200 underline-offset-4">nuevo e innovador</span> para tu gestión.
        </p>
        
        <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100 animate-bounce">
          PRÓXIMAMENTE
        </div>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
        {[
          { label: 'Analíticas Avanzadas', status: 'En diseño' },
          { label: 'Reportes en Vivo', status: 'Desarrollo' },
          { label: 'Predicción de Ventas', status: 'Planificación' },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-center"
          >
            <p className="text-sm font-bold text-gray-800 mb-1">{feature.label}</p>
            <p className="text-xs text-indigo-500 font-medium">{feature.status}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
