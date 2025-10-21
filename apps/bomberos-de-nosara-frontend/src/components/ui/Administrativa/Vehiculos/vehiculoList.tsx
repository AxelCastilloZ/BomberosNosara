import React from 'react';
import type { Vehicle } from '../../../../interfaces/Vehiculos/vehicle';
import {
  Search,
  Filter,
  Calendar,
  Settings,
  Car,
  Truck,
  Wrench,
  HelpCircle,
} from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  getVehicleIcon: (type: string, className?: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onProgramar: (vehiculo: Vehicle) => void;
  onRegistrar: (vehiculo: Vehicle) => void;
  onEstado: (vehiculo: Vehicle) => void;
}

// ---------- helpers de normalización y aliasado ----------
const normalize = (s: string) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Reglas:
 *  - ambulancia -> lancha de rescate
 *  - camion     -> cuadraciclo de patrullaje de playa
 *  - moto / moto acuatica de rescate -> moto acuática de rescate
 */
function aliasType(raw: string): string {
  const n = normalize(raw);
  if (n === 'ambulancia') return 'lancha de rescate';
  if (n === 'camion' || n === 'camión') return 'cuadraciclo de patrullaje de playa';
  if (n === 'moto' || n === 'moto acuatica de rescate' || n === 'moto acuática de rescate')
    return 'moto acuática de rescate';
  if (n === 'vehiculo utilitario' || n === 'vehículo utilitario') return 'vehículo utilitario';
  if (n === 'pickup') return 'pickup';
  if (n === 'lancha de rescate') return 'lancha de rescate';
  if (n === 'cuadraciclo de patrullaje de playa') return 'cuadraciclo de patrullaje de playa';
  return raw;
}

function formatTypeLabel(typeAfterAlias: string): string {
  const k = normalize(typeAfterAlias);
  const map: Record<string, string> = {
    'camion': 'Camión',
    'camión': 'Camión',
    'ambulancia': 'Ambulancia',
    'pickup': 'Pickup',
    'lancha de rescate': 'Lancha de rescate',
    'cuadraciclo de patrullaje de playa': 'Cuadraciclo de Patrullaje de Playa',
    'moto acuatica de rescate': 'Moto Acuática de Rescate',
    'moto acuática de rescate': 'Moto Acuática de Rescate',
    'vehiculo utilitario': 'Vehículo utilitario',
    'vehículo utilitario': 'Vehículo utilitario',
    'otro': 'Otro',
  };
  return map[k] ?? typeAfterAlias;
}

function getStatusLabel(status: string) {
  const n = normalize(status);
  if (n === 'activo') return 'En servicio';
  if (n === 'en mantenimiento') return 'Mantenimiento';
  if (n === 'dado de baja') return 'Dado de baja';
  return status;
}

// ---------- Íconos personalizados (SVG livianos) ----------
const IconBase: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    {children}
  </svg>
);

// Botecito (RIB simple)
const BoatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase className={className}>
    {/* casco */}
    <path d="M3 14h8l3-3 5 1-2 5H6" />
    {/* olas */}
    <path d="M4 18c1.5 1 3.5 1 5 0 1.5 1 3.5 1 5 0 1.5 1 3.5 1 5 0" />
  </IconBase>
);

// Moto acuática (jetski)
const JetSkiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase className={className}>
    {/* perfil */}
    <path d="M4 15h6l2-2 5 .5 3 2.5H6" />
    {/* timón */}
    <path d="M10 13l1-2h2" />
    {/* olas */}
    <path d="M3 18c1.2.9 3 .9 4.2 0 1.2.9 3 .9 4.2 0 1.2.9 3 .9 4.2 0" />
  </IconBase>
);

// Cuadraciclo (ATV)
const AtvIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase className={className}>
    {/* cuerpo */}
    <path d="M7 10h5l2 2h3" />
    <path d="M9 10l1-2h3" />
    {/* ruedas */}
    <circle cx="7" cy="16" r="2.5" />
    <circle cx="17" cy="16" r="2.5" />
  </IconBase>
);

// ---------- Mapeo de íconos según tipo ALIASED ----------
function getIconForAliasedType(type: string, className = 'h-6 w-6 text-slate-600'): React.ReactNode {
  const k = normalize(type);
  if (k === 'lancha de rescate') return <BoatIcon className={className} />;
  if (k === 'moto acuatica de rescate' || k === 'moto acuática de rescate') return <JetSkiIcon className={className} />;
  if (k === 'cuadraciclo de patrullaje de playa') return <AtvIcon className={className} />;
  if (k === 'pickup') return <Car className={className} />;
  if (k === 'camion' || k === 'camión') return <Truck className={className} />;
  if (k === 'vehiculo utilitario' || k === 'vehículo utilitario') return <Wrench className={className} />;
  // fallback genérico
  return <HelpCircle className={className} />;
}

// --- opciones de filtro (varias etiquetas -> mismo valor interno aliased) ---
const TYPE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'Camión', value: normalize(aliasType('camión')) }, // -> cuadraciclo...
  { label: 'Cuadraciclo de Patrullaje de Playa', value: normalize(aliasType('camión')) },
  { label: 'Ambulancia', value: normalize(aliasType('ambulancia')) }, // -> lancha
  { label: 'Lancha de rescate', value: normalize(aliasType('ambulancia')) },
  { label: 'Pickup', value: normalize(aliasType('pickup')) },
  { label: 'Moto Acuática de Rescate', value: normalize(aliasType('moto')) },
  { label: 'Vehículo utilitario', value: normalize(aliasType('vehículo utilitario')) },
  { label: 'Otro', value: normalize(aliasType('otro')) },
];

export default function VehiculoList({
  vehicles,
  onUpdateVehicle,
  getVehicleIcon, // se mantiene como fallback
  getStatusColor,
  onProgramar,
  onRegistrar,
  onEstado,
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all'); // valores normalizados

  const filteredVehicles = vehicles.filter((vehicle) => {
    const placa = (vehicle.placa ?? '').toLowerCase();
    const estado = normalize(vehicle.estadoActual ?? '');
    const aliasedKey = normalize(aliasType(vehicle.tipo ?? ''));

    const matchesSearch = placa.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || estado === statusFilter;
    const matchesType = typeFilter === 'all' || aliasedKey === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white shadow p-4 rounded">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-slate-300 rounded p-2"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 border border-slate-300 rounded p-2"
          >
            <option value="all">Todos los estados</option>
            <option value={normalize('activo')}>Disponible</option>
            <option value={normalize('en mantenimiento')}>Mantenimiento</option>
            <option value={normalize('dado de baja')}>Dado de baja</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-64 border border-slate-300 rounded p-2"
          >
            <option value="all">Todos los tipos</option>
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Vehículos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => {
          const uiType = aliasType(vehicle.tipo ?? ''); // tipo ya mapeado a alias
          const uiTypeLabel = formatTypeLabel(uiType);
          const icon =
            getIconForAliasedType(uiType, 'h-6 w-6 text-slate-600') ??
            (getVehicleIcon ? getVehicleIcon(uiType, 'h-6 w-6 text-slate-600') : <Car className="h-6 w-6 text-slate-600" />);

          return (
            <div key={vehicle.id} className="border rounded shadow hover:shadow-lg transition-all">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{vehicle.placa}</h3>
                    <p className="text-sm text-slate-500">{uiTypeLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.estadoActual)}`} />
                </div>
              </div>

              <div className="p-4 space-y-2">
                {vehicle.estadoInicial && (
                  <div className="text-sm font-medium text-slate-900">
                    Estado inicial: {vehicle.estadoInicial}
                  </div>
                )}
                <div className="text-xs inline-block px-2 py-1 border rounded bg-slate-100">
                  {getStatusLabel(vehicle.estadoActual)}
                </div>
                {vehicle.fechaAdquisicion && (
                  <div className="text-sm flex justify-between">
                    <span className="text-slate-500">Adquisición:</span>
                    <span>{new Date(vehicle.fechaAdquisicion).toLocaleDateString()}</span>
                  </div>
                )}
                {typeof vehicle.kilometraje === 'number' && (
                  <div className="text-sm flex justify-between">
                    <span className="text-slate-500">Kilometraje:</span>
                    <span>{vehicle.kilometraje.toLocaleString()} km</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    className="text-xs flex-1 border rounded py-1 px-2 bg-white hover:bg-slate-50"
                    onClick={() => onEstado(vehicle)}
                  >
                    <Settings className="h-3 w-3 inline-block mr-1" />
                    Estado
                  </button>
                  <button
                    className="text-xs flex-1 border rounded py-1 px-2 bg-white hover:bg-slate-50"
                    onClick={() => onProgramar(vehicle)}
                  >
                    <Calendar className="h-3 w-3 inline-block mr-1" />
                    Programar
                  </button>
                  <button
                    className="text-xs flex-1 border rounded py-1 px-2 bg-white hover:bg-slate-50"
                    onClick={() => onRegistrar(vehicle)}
                  >
                    Registrar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="bg-white text-center p-12 border rounded shadow">
          <Filter className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron vehículos</h3>
          <p className="text-slate-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      <div className="bg-slate-50 border rounded p-4 text-sm flex justify-between">
        <span className="text-slate-600">
          Mostrando {filteredVehicles.length} de {vehicles.length} vehículos
        </span>
        <div className="flex gap-4">
          <span className="text-slate-600">
            En servicio:{' '}
            <span className="font-medium text-emerald-600">
              {filteredVehicles.filter((v) => normalize(v.estadoActual) === 'activo').length}
            </span>
          </span>
          <span className="text-slate-600">
            En mantenimiento:{' '}
            <span className="font-medium text-amber-600">
              {filteredVehicles.filter((v) => normalize(v.estadoActual) === 'en mantenimiento').length}
            </span>
          </span>
          <span className="text-slate-600">
            Dados de baja:{' '}
            <span className="font-medium text-red-600">
              {filteredVehicles.filter((v) => normalize(v.estadoActual) === 'dado de baja').length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
