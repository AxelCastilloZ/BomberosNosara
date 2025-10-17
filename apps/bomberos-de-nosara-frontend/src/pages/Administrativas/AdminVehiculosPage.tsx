// src/pages/Administrativas/AdminVehiculosPage.tsx

import { useState, useMemo } from 'react';
import {
  Truck, 
  ClipboardList, 
  Wrench, 
  ArrowLeft,
} from 'lucide-react';

// Types - AGREGAR IMPORT
import type { Vehiculo } from '../../types/vehiculo.types';

// Componentes del módulo
import { ListaVehiculos } from '../../modules/inventarioVehiculos/components/ListaVehiculos';

// Hook
import { useVehiculos } from '../../modules/inventarioVehiculos/hooks/useVehiculos';

type PageView = 'dashboard' | 'lista';

export default function AdminVehiculosPage() {
  const [viewMode, setViewMode] = useState<PageView>('dashboard');

  // Obtener datos
  const { data: vehiclesResponse, isLoading } = useVehiculos();

  // ✅ TIPAR EXPLÍCITAMENTE EL USEMEMO
const vehicles: Vehiculo[] = (() => {
  if (!vehiclesResponse) return [];
  if (Array.isArray(vehiclesResponse)) return vehiclesResponse;
  if ('data' in vehiclesResponse) return (vehiclesResponse as any).data || [];
  return [];
})();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const enServicio = vehicles.filter(v => v.estadoActual === 'en servicio').length;
    const malos = vehicles.filter(v => v.estadoActual === 'malo').length;
    const fuera = vehicles.filter(v => v.estadoActual === 'fuera de servicio').length;
    const baja = vehicles.filter(v => v.estadoActual === 'dado de baja').length;
    
    return {
      enServicio,
      malos,
      fuera,
      baja,
      total: vehicles.length
    };
  }, [vehicles]);

  const volverAlDashboard = () => {
    setViewMode('dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb]">
      {/* Botón de volver */}
      {viewMode !== 'dashboard' && (
        <button
          onClick={volverAlDashboard}
          className="flex items-center gap-2 mb-4 text-red-700 hover:underline transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Volver al Dashboard
        </button>
      )}

      {/* Vista Dashboard Principal */}
      {viewMode === 'dashboard' && (
        <div className="flex flex-col min-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Truck className="h-8 w-8 text-red-700" />
            <div>
              <h1 className="text-3xl font-extrabold text-red-800">Gestión de Vehículos</h1>
              <p className="text-gray-600 text-sm">
                Sistema integral para la administración y mantenimiento de la flota vehicular de Bomberos de Nosara.
              </p>
            </div>
          </div>

          {/* Cards de navegación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button 
              onClick={() => setViewMode('lista')} 
              className="bg-white border border-gray-200 p-6 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all text-center group"
            >
              <ClipboardList className="h-8 w-8 mx-auto text-gray-600 group-hover:text-red-600 transition-colors" />
              <h3 className="mt-3 font-semibold text-gray-800 group-hover:text-red-700">Lista de Vehículos</h3>
              <p className="text-sm text-gray-600 mt-1">Ver y gestionar todos los vehículos</p>
            </button>

            <button 
              onClick={() => alert('Función en desarrollo')} 
              className="bg-white border border-gray-200 p-6 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all text-center group opacity-50 cursor-not-allowed"
              disabled
            >
              <Wrench className="h-8 w-8 mx-auto text-gray-600 group-hover:text-red-600 transition-colors" />
              <h3 className="mt-3 font-semibold text-gray-800 group-hover:text-red-700">Historial de Mantenimiento</h3>
              <p className="text-sm text-gray-600 mt-1">Próximamente disponible</p>
            </button>
          </div>

          <div className="flex-1"></div>

          {/* Tarjeta de Estadísticas */}
          <div className="max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 mb-0.5">Estado de la Flota</h3>
              <p className="text-xs text-gray-600">Resumen del estado de los vehículos</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-medium text-gray-700">En servicio</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{stats.enServicio}</span>
              </div>
              
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-medium text-gray-700">Malos</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{stats.malos}</span>
              </div>
              
              <div className="flex items-center justify-between p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  <span className="text-xs font-medium text-gray-700">Fuera de servicio</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{stats.fuera}</span>
              </div>
              
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-gray-700">Dado de baja</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{stats.baja}</span>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Total de vehículos</span>
                  <span className="text-base font-bold text-red-700">{stats.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Lista de Vehículos */}
      {viewMode === 'lista' && <ListaVehiculos />}
    </div>
  );
}