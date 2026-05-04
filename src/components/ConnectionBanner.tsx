import React from 'react';

const ConnectionBanner = () => (
  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded shadow-sm">
    <p className="font-bold">Estado de Conexión: Pendiente</p>
    <p>Estamos trabajando en la integración oficial con Meta. Actualmente puedes visualizar el historial de mensajes, pero el envío de respuestas desde este panel aún está en desarrollo.</p>
  </div>
);

export default ConnectionBanner;
