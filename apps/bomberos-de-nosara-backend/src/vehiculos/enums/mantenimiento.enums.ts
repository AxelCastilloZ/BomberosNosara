/**
 * Estados del ciclo de vida de un mantenimiento
 */
export enum EstadoMantenimiento {
  /**
   * Mantenimiento recién programado, aún no llega la fecha
   * Campos opcionales: costo, kilometraje, tecnico
   */
  PENDIENTE = 'pendiente',

  /**
   * Llegó el día del mantenimiento, esperando completar datos
   * Se activa automáticamente el día programado
   */
  EN_REVISION = 'en_revision',

  /**
   * Mantenimiento completado con todos los datos
   * Entra en reportes de costos mensuales
   * Campos requeridos: costo, kilometraje, tecnico
   */
  COMPLETADO = 'completado',
}


export enum TipoMantenimiento {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo'
}