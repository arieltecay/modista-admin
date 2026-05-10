import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const ConnectionBanner = () => (
  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow-sm flex items-center gap-3">
    <FaCheckCircle className="text-green-500 text-xl" />
    <div>
      <p className="font-bold text-green-800">Mila AI: Conexión Oficial Activa</p>
      <p className="text-sm">El negocio ha sido verificado por Meta. Ahora puedes supervisar las conversaciones en tiempo real, entrenar a Mila y enviar respuestas manuales directamente por WhatsApp.</p>
    </div>
  </div>
);

export default ConnectionBanner;
