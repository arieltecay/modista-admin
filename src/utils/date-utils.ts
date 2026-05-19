/**
 * Utilidades para el manejo y formateo de fechas en el panel de administración.
 */

const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Formatea una fecha para mostrar fecha y hora en formato argentino.
 * 
 * @param date - La fecha a formatear (string o Date).
 * @returns Un objeto con la fecha y hora formateadas por separado.
 */
export const formatDateTime = (date: string | Date | undefined) => {
  if (!date) return { date: '-', time: '-' };

  const d = new Date(date);
  
  // Validar si la fecha es válida
  if (isNaN(d.getTime())) return { date: '-', time: '-' };

  const dateStr = d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: ARGENTINA_TIMEZONE
  });

  const timeStr = d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ARGENTINA_TIMEZONE,
    hour12: false
  });

  return {
    date: dateStr,
    time: `${timeStr} hs`,
    full: `${dateStr} ${timeStr} hs`
  };
};

/**
 * Helper para obtener solo la fecha formateada.
 */
export const formatDate = (date: string | Date | undefined) => {
  return formatDateTime(date).date;
};

/**
 * Helper para obtener solo la hora formateada.
 */
export const formatTime = (date: string | Date | undefined) => {
  return formatDateTime(date).time;
};
