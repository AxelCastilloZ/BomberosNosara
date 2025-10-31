


import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { RegistrarMantenimientoModal } from '../modals/RegistrarMantenimientoModal';
import { ProgramarMantenimientoModal } from '../modals/ProgramarMantenimientoModal';
import { TabPorPeriodo } from './TabPorPeriodo';
import { TabPorEquipo } from './TabPorEquipo';

export const DashboardMantenimiento: React.FC = () => {
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showProgramarModal, setShowProgramarModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header con Acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mantenimientos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historial completo y programación de mantenimientos de equipos
          </p>
        </div>
        
        {/* Acciones Rápidas */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => setShowRegistrarModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Mantenimiento
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowProgramarModal(true)}
            className="w-full sm:w-auto"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Programar Mantenimiento
          </Button>
        </div>
      </div>

      {/* Tabs: Por Periodo | Por Equipo */}
      <Tabs defaultValue="periodo">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="periodo" className="flex-1 sm:flex-none">
            Por Periodo
          </TabsTrigger>
          <TabsTrigger value="equipo" className="flex-1 sm:flex-none">
            Por Equipo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periodo">
          <TabPorPeriodo />
        </TabsContent>

        <TabsContent value="equipo">
          <TabPorEquipo />
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <RegistrarMantenimientoModal
        open={showRegistrarModal}
        onOpenChange={setShowRegistrarModal}
        onSuccess={() => {
          // Los hooks se actualizan automáticamente por invalidateQueries
        }}
      />

      <ProgramarMantenimientoModal
        open={showProgramarModal}
        onOpenChange={setShowProgramarModal}
        onSuccess={() => {
          // Los hooks se actualizan automáticamente por invalidateQueries
        }}
      />
    </div>
  );
};