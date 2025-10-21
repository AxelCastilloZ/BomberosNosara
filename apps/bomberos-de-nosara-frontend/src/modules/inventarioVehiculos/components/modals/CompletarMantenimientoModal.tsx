// src/modules/inventarioVehiculos/components/modals/CompletarMantenimientoModal.tsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useVehiculo } from '../../hooks/useVehiculos';
import { useCompletarMantenimiento } from '../../hooks/useMantenimientos';
import { getTipoVehiculoLabel, formatKilometraje } from '../../utils/vehiculoHelpers';
import { completarMantenimientoSchema, VEHICULO_FIELD_LIMITS } from '../../utils/vehiculoValidations';
import type { CompletarMantenimientoFormData } from '../../utils/vehiculoValidations';
import type { CompletarMantenimientoModalProps } from '../../types';

// ==================== COMPONENT ====================

export const CompletarMantenimientoModal: React.FC<CompletarMantenimientoModalProps> = ({
  mantenimiento,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: vehiculo, isLoading: isLoadingVehiculo } = useVehiculo(mantenimiento?.vehiculoId);
  const completarMutation = useCompletarMantenimiento();

  // React Hook Form con Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CompletarMantenimientoFormData>({
    resolver: zodResolver(completarMantenimientoSchema),
    defaultValues: {
      kilometraje: 0,
      tecnico: '',
      costo: 0,
      observaciones: '',
    },
  });

  // Watch para contadores
  const tecnicoValue = watch('tecnico');
  const observacionesValue = watch('observaciones');

  // Pre-llenar el kilometraje cuando se carga el vehículo
  useEffect(() => {
    if (vehiculo && open) {
      setValue('kilometraje', vehiculo.kilometraje);
    }
  }, [vehiculo, open, setValue]);

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset();
      setIsSubmitting(false);
    }
  }, [open, reset]);

  // Si no hay mantenimiento, no renderizar el contenido
  if (!mantenimiento) {
    return null;
  }

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ==================== HANDLERS ====================

  const onSubmit = async (data: CompletarMantenimientoFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await completarMutation.mutateAsync({
        mantenimientoId: mantenimiento.id,
        vehiculoId: mantenimiento.vehiculoId,
        data: {
          kilometraje: data.kilometraje,
          tecnico: data.tecnico,
          costo: data.costo,
          observaciones: data.observaciones,
        },
      });

      success('Mantenimiento completado exitosamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Error al completar mantenimiento:', err);
      error(err?.message || 'Error al completar el mantenimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  // ==================== RENDER ====================

  const isLoading = isLoadingVehiculo;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[95vw] max-w-3xl"
        style={{
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Completar Mantenimiento</DialogTitle>
          <DialogDescription>
            Finaliza un mantenimiento pendiente registrando los detalles de la ejecución
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Cargando información...</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6">
              {/* Información del Mantenimiento (Solo lectura) */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  📋 Información del Mantenimiento
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Vehículo</p>
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {vehiculo?.placa || 'N/A'} - {vehiculo ? getTipoVehiculoLabel(vehiculo.tipo) : ''}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Fecha Programada</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatFecha(mantenimiento.fecha)}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Descripción</p>
                    <p className="text-sm font-medium text-gray-900 break-words overflow-wrap-anywhere">
                      {mantenimiento.descripcion}
                    </p>
                  </div>
                  {mantenimiento.observaciones && (
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Observaciones Iniciales</p>
                      <p className="text-sm text-gray-700 break-words overflow-wrap-anywhere whitespace-pre-line">
                        {mantenimiento.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200"></div>

              {/* Datos para Completar */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  ✏️ Datos del Mantenimiento Realizado
                </h3>

                {/* Kilometraje */}
                <div className="space-y-2">
                  <Label htmlFor="kilometraje">
                    Kilometraje Actual <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kilometraje"
                    type="number"
                    min={vehiculo?.kilometraje || 0}
                    max={VEHICULO_FIELD_LIMITS.kilometraje}
                    step="1"
                    {...register('kilometraje', { valueAsNumber: true })}
                    className={errors.kilometraje ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.kilometraje && (
                    <p className="text-sm text-red-500 mt-1">{errors.kilometraje.message}</p>
                  )}
                  {vehiculo && (
                    <p className="text-sm text-gray-500">
                      Km actual del vehículo: {formatKilometraje(vehiculo.kilometraje)}
                    </p>
                  )}
                </div>

                {/* Técnico */}
                <div className="space-y-2">
                  <Label htmlFor="tecnico">
                    Técnico Responsable <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tecnico"
                    type="text"
                    maxLength={VEHICULO_FIELD_LIMITS.tecnico}
                    placeholder="Nombre del técnico que realizó el mantenimiento"
                    {...register('tecnico')}
                    className={errors.tecnico ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.tecnico && (
                    <p className="text-sm text-red-500 mt-1">{errors.tecnico.message}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {(tecnicoValue?.length || 0)}/{VEHICULO_FIELD_LIMITS.tecnico} caracteres
                  </p>
                </div>

                {/* Costo */}
                <div className="space-y-2">
                  <Label htmlFor="costo">
                    Costo (USD) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="costo"
                    type="number"
                    min="0"
                    max={VEHICULO_FIELD_LIMITS.costo}
                    step="0.01"
                    placeholder="0.00"
                    {...register('costo', { valueAsNumber: true })}
                    className={errors.costo ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.costo && (
                    <p className="text-sm text-red-500 mt-1">{errors.costo.message}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Ingresa el monto total del mantenimiento en dólares
                  </p>
                </div>

                {/* Observaciones Adicionales */}
                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones Adicionales (opcional)</Label>
                  <Textarea
                    id="observaciones"
                    rows={3}
                    maxLength={VEHICULO_FIELD_LIMITS.observacionesMantenimiento}
                    placeholder="Detalles adicionales sobre el trabajo realizado..."
                    {...register('observaciones')}
                    disabled={isSubmitting}
                  />
                  {errors.observaciones && (
                    <p className="text-sm text-red-500 mt-1">{errors.observaciones.message}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {(observacionesValue?.length || 0)}/{VEHICULO_FIELD_LIMITS.observacionesMantenimiento} caracteres
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Completando...' : 'Completar Mantenimiento'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};