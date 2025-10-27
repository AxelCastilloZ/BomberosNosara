
/**
 * Convierte una fecha en formato YYYY-MM-DD (del input date) a DD-MM-YYYY
 */
export const formatearFechaDisplay = (fechaISO: string): string => {
  if (!fechaISO) return '';
  
  // Si ya viene en formato DD-MM-YYYY, retornar tal cual
  const partes = fechaISO.split('-');
  if (partes[0].length === 2) {
    return fechaISO;
  }
  
  // Si viene en formato YYYY-MM-DD, convertir a DD-MM-YYYY
  const [año, mes, dia] = partes;
  return `${dia}-${mes}-${año}`;
};

/**
 * Convierte una fecha en formato DD-MM-YYYY a YYYY-MM-DD (para el input date)
 */
export const formatearFechaInput = (fechaDisplay: string): string => {
  if (!fechaDisplay) return '';
  
  // Si ya viene en formato YYYY-MM-DD, retornar tal cual
  const partes = fechaDisplay.split('-');
  if (partes[0].length === 4) {
    return fechaDisplay;
  }
  
  // Si viene en formato DD-MM-YYYY, convertir a YYYY-MM-DD
  const [dia, mes, año] = partes;
  return `${año}-${mes}-${dia}`;
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (para inputs)
 */
export const obtenerFechaHoyInput = (): string => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

/**
 * Obtiene la fecha actual en formato DD-MM-YYYY (para display)
 */
export const obtenerFechaHoyDisplay = (): string => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const año = hoy.getFullYear();
  return `${dia}-${mes}-${año}`;
};

/**
 * Valida si una fecha está en formato DD-MM-YYYY
 */
export const esFechaValidaDDMMYYYY = (fecha: string): boolean => {
  const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = fecha.match(regex);
  
  if (!match) return false;
  
  const [, dia, mes, año] = match;
  const diaNum = parseInt(dia, 10);
  const mesNum = parseInt(mes, 10);
  const añoNum = parseInt(año, 10);
  
  // Validar rangos básicos
  if (mesNum < 1 || mesNum > 12) return false;
  if (diaNum < 1 || diaNum > 31) return false;
  if (añoNum < 1900 || añoNum > 2100) return false;
  
  // Validar fecha completa
  const fechaObj = new Date(añoNum, mesNum - 1, diaNum);
  return fechaObj.getDate() === diaNum &&
         fechaObj.getMonth() === mesNum - 1 &&
         fechaObj.getFullYear() === añoNum;
};

/**
 * Formatea fecha y hora para display (ej: "26-10-2025 14:30")
 */
export const formatearFechaHora = (fecha: string, hora: string): string => {
  const fechaFormateada = formatearFechaDisplay(fecha);
  return `${fechaFormateada} ${hora}`;
};