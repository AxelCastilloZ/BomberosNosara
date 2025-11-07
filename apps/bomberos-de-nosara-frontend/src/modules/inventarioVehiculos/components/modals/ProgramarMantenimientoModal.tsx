// src/modules/inventarioVehiculos/components/modals/ProgramarMantenimientoModal.tsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseModal } from '../../../../components/ui/base-modal';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select } from '../../../../components/ui/select';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useVehiculos } from '../../hooks/useVehiculos';
import { useProgramarMantenimiento } from '../../hooks/useMantenimientos';
import { getVehiculoIcon, getTipoVehiculoLabel, formatKilometraje } from '../../utils/vehiculoHelpers';
import { programarMantenimientoSchema, VEHICULO_FIELD_LIMITS } from '../../utils/vehiculoValidations';
import type { ProgramarMantenimientoFormData } from '../../utils/vehiculoValidations';
import type { ProgramarMantenimientoModalProps } from '../../types';
import type { Vehiculo } from '../../../../types/vehiculo.types';
import { TipoMantenimiento } from '../../../../types/mantenimiento.types';

// ==================== COMPONENT ====================

export const ProgramarMantenimientoModal: React.FC<ProgramarMantenimientoModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: vehiculosResponse, isLoading: isLoadingVehiculos } = useVehiculos();
  const programarMutation = useProgramarMantenimiento();

  // Extraer vehículos de forma segura
  const vehiculos: Vehiculo[] = (() => {
    if (!vehiculosResponse) return [];
    if (Array.isArray(vehiculosResponse)) return vehiculosResponse;
    if ('data' in vehiculosResponse) return (vehiculosResponse as any).data || [];
    return [];
  })();

  // React Hook Form con Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProgramarMantenimientoFormData>({
    resolver: zodResolver(programarMantenimientoSchema),
    defaultValues: {
      vehiculoId: '',
      tipo: TipoMantenimiento.PREVENTIVO,
      fecha: '',
      descripcion: '',
      observaciones: '',
    },
  });

  const vehiculoSeleccionadoId = watch('vehiculoId');

  // Calcular fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset();
      setIsSubmitting(false);
    }
  }, [open, reset]);

  // Obtener info del vehículo seleccionado
  const vehiculoSeleccionado = vehiculos.find((v: Vehiculo) => v.id === vehiculoSeleccionadoId);

  // ==================== HANDLERS ====================

  const onSubmit = async (data: ProgramarMantenimientoFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await programarMutation.mutateAsync({
        vehiculoId: data.vehiculoId,
        data: {
          tipo: data.tipo,
          fecha: data.fecha,
          descripcion: data.descripcion,
          observaciones: data.observaciones || undefined,
        },
      });

      success('Mantenimiento programado exitosamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Error al programar mantenimiento:', err);
      error(err?.message || 'Error al programar el mantenimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  // ==================== RENDER ====================

  // Footer content con botones
  const footerContent = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        form="programar-mantenimiento-vehiculo-form"
        disabled={isSubmitting || isLoadingVehiculos}
      >
        {isSubmitting ? 'Programando...' : 'Programar'}
      </Button>
    </>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={handleClose}
      title="Programar Mantenimiento"
      description="Agenda un mantenimiento futuro para un vehículo"
      size="xl"
      footerContent={footerContent}
    >
      <form id="programar-mantenimiento-vehiculo-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Vehículo */}
          <div className="space-y-2">
            <Label htmlFor="vehiculoId">
              Vehículo <span className="text-red-500">*</span>
            </Label>
            <Select
              id="vehiculoId"
              {...register('vehiculoId')}
              className={errors.vehiculoId ? 'border-red-500' : ''}
              disabled={isLoadingVehiculos || isSubmitting}
            >
              <option value="">Selecciona un vehículo</option>
              {vehiculos.map((vehiculo: Vehiculo) => (
                <option key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.placa} - {getTipoVehiculoLabel(vehiculo.tipo)}
                </option>
              ))}
            </Select>
            {errors.vehiculoId && (
              <p className="text-sm text-red-500 mt-1">{errors.vehiculoId.message}</p>
            )}
            {vehiculoSeleccionado && (
              <p className="text-sm text-gray-500 mt-1">
                Km actual: {formatKilometraje(vehiculoSeleccionado.kilometraje)}
              </p>
            )}
          </div>

          {/* Tipo de Mantenimiento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo de Mantenimiento <span className="text-red-500">*</span>
            </Label>
            <Select
              id="tipo"
              {...register('tipo')}
              className={errors.tipo ? 'border-red-500' : ''}
              disabled={isSubmitting}
            >
              <option value={TipoMantenimiento.PREVENTIVO}>Preventivo</option>
              <option value={TipoMantenimiento.CORRECTIVO}>Correctivo</option>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-red-500 mt-1">{errors.tipo.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Preventivo: mantenimiento planificado | Correctivo: reparación de falla
            </p>
          </div>

          {/* Fecha del Mantenimiento */}
          <div className="space-y-2">
            <Label htmlFor="fecha">
              Fecha del Mantenimiento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              min={getMinDate()}
              {...register('fecha')}
              className={errors.fecha ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.fecha && (
              <p className="text-sm text-red-500 mt-1">{errors.fecha.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Solo se pueden programar mantenimientos para fechas futuras
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descripcion"
              type="text"
              maxLength={VEHICULO_FIELD_LIMITS.descripcion}
              placeholder="Ej: Revisión programada de frenos"
              {...register('descripcion')}
              className={errors.descripcion ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500 mt-1">{errors.descripcion.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Máximo {VEHICULO_FIELD_LIMITS.descripcion} caracteres
            </p>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              rows={3}
              maxLength={VEHICULO_FIELD_LIMITS.observaciones}
              placeholder="Notas adicionales sobre el mantenimiento programado..."
              {...register('observaciones')}
              disabled={isSubmitting}
            />
            {errors.observaciones && (
              <p className="text-sm text-red-500 mt-1">{errors.observaciones.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Máximo {VEHICULO_FIELD_LIMITS.observaciones} caracteres
            </p>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};