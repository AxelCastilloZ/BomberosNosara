// src/modules/inventarioVehiculos/components/modals/EditarVehiculoModal.tsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BaseModal } from '../../../../components/ui/base-modal';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useUpdateVehiculo, useDeleteVehiculo } from '../../hooks/useVehiculos';
import { DangerZone } from '../../../../components/common/inventory/DangerZone';
import { editVehiculoSchema, VEHICULO_FIELD_LIMITS } from '../../utils/vehiculoValidations';
import type { EditVehiculoFormData } from '../../utils/vehiculoValidations';
import {
  TIPO_VEHICULO_OPTIONS,
  ESTADO_INICIAL_OPTIONS,
} from '../../utils/vehiculoHelpers';
import type { Vehiculo } from '../../../../types/vehiculo.types';

interface EditarVehiculoModalProps {
  vehiculo: Vehiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditarVehiculoModal: React.FC<EditarVehiculoModalProps> = ({
  vehiculo,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const updateVehiculoMutation = useUpdateVehiculo();
  const deleteVehiculoMutation = useDeleteVehiculo();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditVehiculoFormData>({
    resolver: zodResolver(editVehiculoSchema),
  });

  const placaValue = watch('placa');

  useEffect(() => {
    if (open && vehiculo) {
      reset({
        placa: vehiculo.placa,
        tipo: vehiculo.tipo,
        fechaAdquisicion: vehiculo.fechaAdquisicion?.split('T')[0] || '',
        kilometraje: vehiculo.kilometraje,
      });
      setShowDeleteConfirm(false);
    }
  }, [open, vehiculo, reset]);

  const onSubmit = async (data: EditVehiculoFormData) => {
    if (!vehiculo) return;

    try {
      // Construir objeto solo con campos que cambiaron
      const updates: Partial<EditVehiculoFormData> = {};
      
      if (data.placa && data.placa !== vehiculo.placa) {
        updates.placa = data.placa;
      }
      if (data.tipo && data.tipo !== vehiculo.tipo) {
        updates.tipo = data.tipo;
      }
      if (data.fechaAdquisicion && data.fechaAdquisicion !== vehiculo.fechaAdquisicion?.split('T')[0]) {
        updates.fechaAdquisicion = data.fechaAdquisicion;
      }
      if (data.kilometraje !== undefined && data.kilometraje !== vehiculo.kilometraje) {
        updates.kilometraje = data.kilometraje;
      }

      // Validar que haya al menos un cambio
      if (Object.keys(updates).length === 0) {
        error('No hay cambios para guardar');
        return;
      }

      await updateVehiculoMutation.mutateAsync({
        id: vehiculo.id,
        data: updates,
      });
      
      success('Vehículo actualizado correctamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      error(err?.message || 'Error al actualizar el vehículo');
    }
  };

  const handleDelete = async () => {
    if (!vehiculo) return;

    try {
      await deleteVehiculoMutation.mutateAsync(vehiculo.id);
      success('Vehículo movido a la papelera');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      // 🔥 Extraer información del error
      const errorCode = err?.response?.data?.message?.code;
      const errorMessage = err?.response?.data?.message?.message;
      
      // Extraer mensaje legible del stack si existe
      let readableMessage = errorMessage;
      if (err?.response?.data?.stack) {
        const stackMatch = err.response.data.stack.match(/BadRequestException: (.+?)(?:\n|$)/);
        if (stackMatch && stackMatch[1]) {
          readableMessage = stackMatch[1];
        }
      }

      if (errorCode === 'HAS_PENDING_MAINTENANCE') {
        error(
          readableMessage || 'No se puede eliminar el vehículo porque tiene mantenimientos pendientes',
          {
            title: 'No se puede eliminar',
            duration: 10000
          }
        );
        setShowDeleteConfirm(false);
      } else {
        error(readableMessage || err?.message || 'Error al eliminar el vehículo');
      }
    }
  };

  const handleClose = () => {
    if (!updateVehiculoMutation.isPending && !deleteVehiculoMutation.isPending) {
      reset();
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!vehiculo) return null;

  // Footer content con botones
  const footerContent = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={updateVehiculoMutation.isPending || deleteVehiculoMutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="editar-vehiculo-form"
        disabled={updateVehiculoMutation.isPending || deleteVehiculoMutation.isPending}
      >
        {updateVehiculoMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={handleClose}
      title="Editar Vehículo"
      description={`Placa: ${vehiculo.placa}`}
      size="xl"
      footerContent={footerContent}
    >
      <form id="editar-vehiculo-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Campos editables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placa */}
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                {...register('placa')}
                placeholder="ABC-123"
                maxLength={VEHICULO_FIELD_LIMITS.placa}
                className={errors.placa ? 'border-red-500' : ''}
                disabled={updateVehiculoMutation.isPending}
              />
              {errors.placa && (
                <p className="text-sm text-red-500 mt-1">{errors.placa.message}</p>
              )}
              <p className="text-sm text-gray-500">
                {(placaValue?.length || 0)}/{VEHICULO_FIELD_LIMITS.placa} caracteres
              </p>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de vehículo</Label>
              <Select
                id="tipo"
                {...register('tipo')}
                className={errors.tipo ? 'border-red-500' : ''}
                disabled={updateVehiculoMutation.isPending}
              >
                <option value="">Selecciona un tipo</option>
                {TIPO_VEHICULO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.tipo && (
                <p className="text-sm text-red-500 mt-1">{errors.tipo.message}</p>
              )}
            </div>

            {/* Fecha de Adquisición */}
            <div className="space-y-2">
              <Label htmlFor="fechaAdquisicion">Fecha de adquisición</Label>
              <Input
                id="fechaAdquisicion"
                type="date"
                max={getMaxDate()}
                {...register('fechaAdquisicion')}
                className={errors.fechaAdquisicion ? 'border-red-500' : ''}
                disabled={updateVehiculoMutation.isPending}
              />
              {errors.fechaAdquisicion && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fechaAdquisicion.message}
                </p>
              )}
            </div>

            {/* Kilometraje */}
            <div className="space-y-2">
              <Label htmlFor="kilometraje">Kilometraje (km)</Label>
              <Input
                id="kilometraje"
                type="number"
                {...register('kilometraje', {
                  valueAsNumber: true,
                })}
                placeholder="0"
                min="0"
                max={VEHICULO_FIELD_LIMITS.kilometraje}
                className={errors.kilometraje ? 'border-red-500' : ''}
                disabled={updateVehiculoMutation.isPending}
              />
              {errors.kilometraje && (
                <p className="text-sm text-red-500 mt-1">{errors.kilometraje.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Kilometraje actual: {vehiculo.kilometraje.toLocaleString()} km
              </p>
            </div>
          </div>

          {/* DangerZone */}
          <DangerZone
            title="Zona de Peligro"
            description="Eliminar este vehículo lo moverá a la papelera"
          >
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={updateVehiculoMutation.isPending || deleteVehiculoMutation.isPending}
              >
                Eliminar vehículo
              </Button>
            ) : (
              <Alert
                variant="destructive"
                actions={[
                  {
                    label: 'Cancelar',
                    onClick: () => setShowDeleteConfirm(false),
                    variant: 'default',
                  },
                  {
                    label: 'Mover a papelera',
                    onClick: handleDelete,
                    variant: 'destructive',
                    disabled: deleteVehiculoMutation.isPending,
                  },
                ]}
              >
                <AlertDescription>
                  El vehículo será movido a la papelera y dejará de aparecer en las listas
                  principales. Podrás restaurarlo en cualquier momento si lo necesitas.
                </AlertDescription>
              </Alert>
            )}
          </DangerZone>
        </div>
      </form>
    </BaseModal>
  );
};