// src/pages/Administrativas/AdminVehiculosPage.tsx

import { useState, useMemo } from 'react';
import {
  Truck, 
  ClipboardList, 
  Wrench, 
  ArrowLeft,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

// Types
import type { Vehiculo } from '../../types/vehiculo.types';

// Componentes del módulo
import { ListaVehiculos } from '../../modules/inventarioVehiculos/components/ListaVehiculos';
import { DashboardMantenimiento } from '../../modules/inventarioVehiculos/components/mantenimientos/DashboardMantenimiento';

// Hooks
import { useVehiculos } from '../../modules/inventarioVehiculos/hooks/useVehiculos';
import { 
  useMantenimientosPendientes,
  useTodosMantenimientos,
} from '../../modules/inventarioVehiculos/hooks/useMantenimientos';
import { useCostosMensuales } from '../../modules/inventarioVehiculos/hooks/useReportes';

// Utils
import { calcularDiasHasta } from '../../modules/inventarioVehiculos/utils/vehiculoHelpers';

type PageView = 'dashboard' | 'lista' | 'mantenimiento';

export default function AdminVehiculosPage() {
  const [viewMode, setViewMode] = useState<PageView>('dashboard');

  // Obtener datos de vehículos
  const { data: vehiclesResponse, isLoading: isLoadingVehicles } = useVehiculos();

  // Obtener datos de mantenimientos
  const { data: mantenimientosPendientes = [], isLoading: isLoadingPendientes } = useMantenimientosPendientes();
  const { data: todosMantenimientos = [], isLoading: isLoadingTodos } = useTodosMantenimientos();

  // Obtener costos del mes actual
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();
  const { data: costosMensuales, isLoading: isLoadingCostos } = useCostosMensuales(mesActual, anioActual);

  // Extracción segura con tipo explícito
  const vehicles: Vehiculo[] = (() => {
    if (!vehiclesResponse) return [];
    if (Array.isArray(vehiclesResponse)) return vehiclesResponse;
    if ('data' in vehiclesResponse) return (vehiclesResponse as any).data || [];
    return [];
  })();

  // Calcular estadísticas de vehículos
  const statsVehiculos = useMemo(() => {
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

  // Calcular estadísticas de mantenimientos
  const statsMantenimientos = useMemo(() => {
    // Próximo mantenimiento
    const pendientesOrdenados = [...mantenimientosPendientes].sort((a, b) => {
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });
    const proximoMantenimiento = pendientesOrdenados[0];
    const diasHastaProximo = proximoMantenimiento 
      ? calcularDiasHasta(proximoMantenimiento.fecha)
      : null;

    // Mantenimientos del mes actual
    const mantenimientosDelMes = todosMantenimientos.filter(m => {
      const fecha = new Date(m.fecha);
      return fecha.getMonth() === mesActual - 1 && fecha.getFullYear() === anioActual;
    });

    return {
      pendientes: mantenimientosPendientes.length,
      delMes: mantenimientosDelMes.length,
      costoDelMes: costosMensuales?.total || 0,
      diasHastaProximo,
      proximoMantenimiento,
    };
  }, [mantenimientosPendientes, todosMantenimientos, costosMensuales, mesActual, anioActual]);

  const volverAlDashboard = () => {
    setViewMode('dashboard');
  };

  // Loading state
  const isLoading = isLoadingVehicles || isLoadingPendientes || isLoadingTodos || isLoadingCostos;

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Cargando información...</p>
        </div>
      </div>
    );
  }

  const formatCosto = (costo: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(costo);
  };

  const getTextoProximoMantenimiento = () => {
    if (!statsMantenimientos.diasHastaProximo) {
      return 'Sin programar';
    }
    const dias = statsMantenimientos.diasHastaProximo;
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    if (dias < 0) return `Atrasado ${Math.abs(dias)} día${Math.abs(dias) > 1 ? 's' : ''}`;
    return `En ${dias} día${dias > 1 ? 's' : ''}`;
  };

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
              onClick={() => setViewMode('mantenimiento')} 
              className="bg-white border border-gray-200 p-6 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all text-center group"
            >
              <Wrench className="h-8 w-8 mx-auto text-gray-600 group-hover:text-red-600 transition-colors" />
              <h3 className="mt-3 font-semibold text-gray-800 group-hover:text-red-700">Mantenimiento de Vehículos</h3>
              <p className="text-sm text-gray-600 mt-1">Gestión de mantenimientos</p>
            </button>
          </div>

          <div className="flex-1"></div>

          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
            {/* Card: Estado de la Flota */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-0.5">Estado de la Flota</h3>
                <p className="text-xs text-gray-600">Resumen del estado de los vehículos</p>
              </div>
              
              <div className="space-y-2">
                {/* ✅ En servicio - Verde corporativo */}
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                    <span className="text-xs font-medium text-gray-700">En servicio</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{statsVehiculos.enServicio}</span>
                </div>
                
                {/* ⚠️ Malos - Amarillo advertencia */}
                <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                    <span className="text-xs font-medium text-gray-700">Malos</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{statsVehiculos.malos}</span>
                </div>
                
                {/* ⚪ Fuera de servicio - Gris neutral */}
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <span className="text-xs font-medium text-gray-700">Fuera de servicio</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{statsVehiculos.fuera}</span>
                </div>
                
                {/* ❌ Dado de baja - Rojo corporativo */}
                <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                    <span className="text-xs font-medium text-gray-700">Dado de baja</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{statsVehiculos.baja}</span>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Total de vehículos</span>
                    <span className="text-base font-bold text-red-700">{statsVehiculos.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Mantenimientos */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-0.5">Mantenimientos</h3>
                <p className="text-xs text-gray-600">Resumen de mantenimientos programados</p>
              </div>
              
              <div className="space-y-2">
                {/* ℹ️ Pendientes - Azul info */}
                <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-gray-700">Pendientes</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{statsMantenimientos.pendientes}</span>
                </div>
                
                {/* 📅 Este mes - Azul (cambiado de purple) */}
                <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-gray-700">Este mes</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{statsMantenimientos.delMes}</span>
                </div>
                
                {/* 💰 Gastos del mes - Verde */}
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-gray-700">Gastos del mes</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{formatCosto(statsMantenimientos.costoDelMes)}</span>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Próximo mantenimiento</span>
                    <span className={`text-sm font-bold ${
                      statsMantenimientos.diasHastaProximo !== null && statsMantenimientos.diasHastaProximo < 0
                        ? 'text-red-600'
                        : statsMantenimientos.diasHastaProximo !== null && statsMantenimientos.diasHastaProximo <= 3
                        ? 'text-orange-600'
                        : 'text-blue-600'
                    }`}>
                      {getTextoProximoMantenimiento()}
                    </span>
                  </div>
                  {statsMantenimientos.proximoMantenimiento && (
                    <p className="text-xs text-gray-500 mt-1">
                      {statsMantenimientos.proximoMantenimiento.vehiculo?.placa || 'N/A'} - {statsMantenimientos.proximoMantenimiento.descripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Lista de Vehículos */}
      {viewMode === 'lista' && <ListaVehiculos />}

      {/* Vista Dashboard de Mantenimiento */}
      {viewMode === 'mantenimiento' && <DashboardMantenimiento />}
    </div>
  );
}