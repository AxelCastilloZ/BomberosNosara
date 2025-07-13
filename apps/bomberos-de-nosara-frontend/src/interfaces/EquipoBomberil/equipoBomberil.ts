import { CatalogoEquipo } from './catalogoEquipo';

export interface EquipoBomberil {
  id: string;
  catalogoId: string;
  catalogo: CatalogoEquipo;

  fechaAdquisicion: string;
  estadoInicial: 'nuevo' | 'usado';
  estadoActual: 'activo' | 'en mantenimiento' | 'dado de baja' | 'en reparación';

  numeroSerie?: string;
  fotoUrl?: string;
  cantidad: number;

  reposicionSolicitada?: boolean;
  motivoReposicion?: string;
  observacionesReposicion?: string;
}
