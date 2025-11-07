// src/modules/inventarioVehiculos/components/modals/RegistrarMantenimientoModal.tsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseModal } from '../../../../components/ui/base-modal';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useVehiculos } from '../../hooks/useVehiculos';
import { useRegistrarMantenimiento } from '../../hooks/useMantenimientos';
import { getTipoVehiculoLabel, formatKilometraje } from '../../utils/vehiculoHelpers';
import { registrarMantenimientoSchema, VEHICULO_FIELD_LIMITS } from '../../utils/vehiculoValidations';
import type { RegistrarMantenimientoFormData } from '../../utils/vehiculoValidations';
import type { Vehiculo } from '../../../../types/vehiculo.types';
import { TipoMantenimiento } from '../../../../types/mantenimiento.types';

interface RegistrarMantenimientoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegistrarMantenimientoModal: React.FC<RegistrarMantenimientoModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const registrarMutation = useRegistrarMantenimiento();
  const { data: vehiculosResponse, isLoading: isLoadingVehiculos } = useVehiculos();

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
    watch,
    reset,
    setValue,
  } = useForm<RegistrarMantenimientoFormData>({
    resolver: zodResolver(registrarMantenimientoSchema),
    defaultValues: {
      vehiculoId: '',
      tipo: TipoMantenimiento.CORRECTIVO,
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      kilometraje: 0,
      tecnico: '',
      costo: 0,
      observaciones: '',
    },
  });

  const vehiculoIdSeleccionado = watch('vehiculoId');
  const vehiculoSeleccionado = vehiculos.find((v) => v.id === vehiculoIdSeleccionado);

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        vehiculoId: '',
        tipo: TipoMantenimiento.CORRECTIVO,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        kilometraje: 0,
        tecnico: '',
        costo: 0,
        observaciones: '',
      });
    }
  }, [open, reset]);

  // Actualizar kilometraje cuando cambia el vehículo seleccionado
  useEffect(() => {
    if (vehiculoSeleccionado) {
      setValue('kilometraje', vehiculoSeleccionado.kilometraje);
    }
  }, [vehiculoSeleccionado, setValue]);

  // ==================== HANDLERS ====================

  const onSubmit = async (data: RegistrarMantenimientoFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await registrarMutation.mutateAsync({
        vehiculoId: data.vehiculoId,
        data: {
          tipo: data.tipo,
          fecha: data.fecha,
          descripcion: data.descripcion,
          kilometraje: data.kilometraje,
          tecnico: data.tecnico,
          costo: data.costo,
          observaciones: data.observaciones,
        },
      });

      success('Mantenimiento registrado correctamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Error al registrar mantenimiento:', err);
      error(err?.message || 'Error al registrar el mantenimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  // Calcular fecha máxima (hoy)
  const maxDate = new Date().toISOString().split('T')[0];

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
        form="registrar-mantenimiento-vehiculo-form"
        disabled={isSubmitting || isLoadingVehiculos}
      >
        {isSubmitting ? 'Registrando...' : 'Registrar'}
      </Button>
    </>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={handleClose}
      title="Registrar Mantenimiento"
      description="Registra un mantenimiento que ya se realizó"
      size="md"
      footerContent={footerContent}
    >
      <form id="registrar-mantenimiento-vehiculo-form" onSubmit={handleSubmit(onSubmit)}>
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
              {vehiculos.map((vehiculo) => (
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
              max={maxDate}
              {...register('fecha')}
              className={errors.fecha ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.fecha && (
              <p className="text-sm text-red-500 mt-1">{errors.fecha.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Solo mantenimientos pasados o de hoy
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
              placeholder="Ej: Cambio de aceite y filtros"
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

          {/* Grid 2 columnas: Kilometraje y Técnico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kilometraje */}
            <div className="space-y-2">
              <Label htmlFor="kilometraje">
                Kilometraje (km) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kilometraje"
                type="number"
                min="0"
                max={VEHICULO_FIELD_LIMITS.kilometraje}
                placeholder="0"
                {...register('kilometraje', { valueAsNumber: true })}
                className={errors.kilometraje ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.kilometraje && (
                <p className="text-sm text-red-500 mt-1">{errors.kilometraje.message}</p>
              )}
            </div>

            {/* Técnico */}
            <div className="space-y-2">
              <Label htmlFor="tecnico">
                Técnico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tecnico"
                type="text"
                maxLength={VEHICULO_FIELD_LIMITS.tecnico}
                placeholder="Nombre del técnico"
                {...register('tecnico')}
                className={errors.tecnico ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.tecnico && (
                <p className="text-sm text-red-500 mt-1">{errors.tecnico.message}</p>
              )}
            </div>
          </div>

          {/* Costo */}
          <div className="space-y-2">
            <Label htmlFor="costo">
              Costo (USD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="costo"
              type="number"
              step="0.01"
              min="0"
              max={VEHICULO_FIELD_LIMITS.costo}
              placeholder="0.00"
              {...register('costo', { valueAsNumber: true })}
              className={errors.costo ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.costo && (
              <p className="text-sm text-red-500 mt-1">{errors.costo.message}</p>
            )}
            <p className="text-sm text-gray-500">Ingresa el monto en dólares</p>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              rows={3}
              maxLength={VEHICULO_FIELD_LIMITS.observaciones}
              placeholder="Notas adicionales sobre el mantenimiento..."
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