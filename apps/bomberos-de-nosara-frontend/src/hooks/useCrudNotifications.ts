
// src/hooks/useCrudNotifications.ts
import { useNotifications } from '../components/common/notifications/NotificationProvider';

export const useCrudNotifications = () => {
  const { success, error } = useNotifications();

  return {
    // Operaciones exitosas
    notifyCreated: (item: string = 'elemento') => 
      success(`${item} creado correctamente`),
    
    notifyUpdated: (item: string = 'elemento') => 
      success(`${item} actualizado correctamente`),
    
    notifyDeleted: (item: string = 'elemento') => 
      success(`${item} eliminado correctamente`),
    
    notifyRestored: (item: string = 'elemento') => 
      success(`${item} restaurado correctamente`),
    
    // Errores comunes
    notifyError: (operation: string = 'operación', details?: string) => 
      error(`Error al realizar ${operation}${details ? `: ${details}` : ''}`),
    
    notifyValidationError: () => 
      error('Por favor revisa los datos ingresados'),
    
    notifyNetworkError: () => 
      error('Error de conexión. Verifica tu internet.'),
    
    notifyUnauthorized: () => 
      error('No tienes permisos para realizar esta acción'),
    
    notifyNotFound: (item: string = 'elemento') => 
      error(`${item} no encontrado`),
  };
};