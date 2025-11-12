/**
 * Enums para el módulo de Equipo Bomberil
 * Define los tipos y estados posibles de los equipos
 */

/**
 * Tipos de equipos bomberiles disponibles en el inventario
 */
export enum TipoEquipo {
  MOTOGUADANA = 'motoguadaña',
  SOPLADORA = 'sopladora',
  TRONZADORA = 'tronzadora',
  MOTOSIERRA = 'motosierra',
  BOMBA_AGUA = 'bomba_agua',
}

/**
 * Estados operacionales de un equipo bomberil
 * Define el ciclo de vida y disponibilidad del equipo
 */
export enum EstadoEquipo {
  /**
   * Equipo operativo y disponible para uso
   */
  EN_SERVICIO = 'en_servicio',

  /**
   * Equipo con fallas pero aún en inventario
   */
  MALO = 'malo',

  /**
   * Equipo temporalmente no disponible (en reparación, mantenimiento, etc.)
   */
  FUERA_DE_SERVICIO = 'fuera_de_servicio',

  /**
   * Equipo dado de baja definitivamente
   */
  BAJA = 'baja',
}
