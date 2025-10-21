export type EstadoVehiculo =
  | 'activo'
  | 'en mantenimiento'
  | 'dado de baja';

export type TipoVehiculo =
  | 'Camión'
  | 'Ambulancia'
  | 'Pickup'
  | 'Lancha de rescate'
  | 'Moto Acúatica de Rescate'
  | 'Cuadraciclo de Patrullaje de Playa'
  | 'Vehículo Utilitario'
  | 'otro';

export interface Vehicle {
  id: string;
  placa: string;
  tipo: TipoVehiculo;

  estadoInicial: 'nuevo' | 'usado';
  estadoActual: EstadoVehiculo;

  fechaAdquisicion: string;
  kilometraje: number;

  fotoUrl?: string;
  observaciones?: string;


  reposicionSolicitada?: boolean;
  motivoReposicion?: string;
  observacionesReposicion?: string;

  fechaProximoMantenimiento?: string;
}





export interface ReposicionData {
  motivo: string;
  observaciones?: string;
}


export interface MantenimientoData {
  fecha: string;
  descripcion: string;
  kilometraje: number;
  tecnico: string;
  costo: number;
  observaciones?: string;
}




export interface MantenimientoProgramadoData {
  fechaProximoMantenimiento: string;
  tecnico: string;
  tipo: string;
  prioridad: string;
  observaciones?: string;
}
