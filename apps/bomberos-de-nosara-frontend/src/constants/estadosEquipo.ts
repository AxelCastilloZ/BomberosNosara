import type { EquipoBomberil } from '../interfaces/EquipoBomberil/equipoBomberil';

export const ESTADOS_EQUIPO: EquipoBomberil['estadoActual'][] = [
  'disponible',
  'en mantenimiento',
  'dado de baja',
];

export const ESTADOS_LABEL: Record<EquipoBomberil['estadoActual'], string> = {
  disponible: 'Disponible',
  'en mantenimiento': 'En mantenimiento',
  'dado de baja': 'Dado de baja',
};
