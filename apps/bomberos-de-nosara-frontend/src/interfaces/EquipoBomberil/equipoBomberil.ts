// Tipos base reutilizables
export type TipoCatalogo = 'terrestre' | 'marítimo' | (string & {}); // permite otros valores
export type EstadoInicial = 'nuevo' | 'usado';
export type EstadoActual = 'disponible' | 'en mantenimiento' | 'dado de baja';

// ===== Catálogo / Equipo =====
export interface CatalogoRef {
  id: string;
  nombre: string;
  tipo: TipoCatalogo;
}

export interface EquipoBomberil {
  id: string;
  catalogo: CatalogoRef;
  fechaAdquisicion: string;             // ISO YYYY-MM-DD
  estadoInicial: EstadoInicial;
  estadoActual: EstadoActual;
  numeroSerie?: string;
  fotoUrl?: string;
  cantidad: number;
}

// ===== Mantenimiento (historial) =====
export interface EquipoMantenimiento {
  id: string;
  fecha: string;                         // ISO YYYY-MM-DD
  descripcion: string;
  tecnico: string;
  costo?: number;
  observaciones?: string;
}

// Para crear (no envías id)
export type NuevoMantenimientoDTO = Omit<EquipoMantenimiento, 'id'>;

// ===== Mantenimiento programado (próximo) =====
export interface EquipoMantenimientoProgramado {
  fechaProximoMantenimiento: string;     // ISO YYYY-MM-DD
  tecnico: string;
  tipo: 'preventivo' | 'correctivo' | 'inspección';
  prioridad: 'baja' | 'media' | 'alta';
  observaciones?: string;
}

// (Opcional) DTO para programar mantenimiento
export type NuevoMantenimientoProgramadoDTO = EquipoMantenimientoProgramado;
