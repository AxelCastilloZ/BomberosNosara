// src/modules/inventarioEquipos/components/modals/EditarEquipoModal.tsx

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
import { useUpdateEquipo, useDeleteEquipo } from '../../hooks/useEquipos';
import { DangerZone } from '../../../../components/common/inventory/DangerZone';
import { editEquipoSchema, EQUIPO_FIELD_LIMITS } from '../../utils/equipoBomberilValidations';
import type { EditEquipoFormData } from '../../utils/equipoBomberilValidations';
import {
  TIPO_EQUIPO_OPTIONS,
  ESTADO_INICIAL_OPTIONS,
} from '../../utils/equipoBomberilHelpers';
import type { EquipoBomberil } from '../../../../types/equipoBomberil.types';

interface EditarEquipoModalProps {
  equipo: EquipoBomberil | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditarEquipoModal: React.FC<EditarEquipoModalProps> = ({
  equipo,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const updateEquipoMutation = useUpdateEquipo();
  const deleteEquipoMutation = useDeleteEquipo();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditEquipoFormData>({
    resolver: zodResolver(editEquipoSchema),
  });

  const numeroSerieValue = watch('numeroSerie');
  const nombreValue = watch('nombre');

  useEffect(() => {
    if (open && equipo) {
      reset({
        numeroSerie: equipo.numeroSerie,
        nombre: equipo.nombre,
        tipo: equipo.tipo,
        fechaAdquisicion: equipo.fechaAdquisicion?.split('T')[0] || '',
      });
      setShowDeleteConfirm(false);
    }
  }, [open, equipo, reset]);

  const onSubmit = async (data: EditEquipoFormData) => {
    if (!equipo) return;

    try {
      // Construir objeto solo con campos que cambiaron
      const updates: Partial<EditEquipoFormData> = {};
      
      if (data.numeroSerie && data.numeroSerie !== equipo.numeroSerie) {
        updates.numeroSerie = data.numeroSerie;
      }
      if (data.nombre && data.nombre !== equipo.nombre) {
        updates.nombre = data.nombre;
      }
      if (data.tipo && data.tipo !== equipo.tipo) {
        updates.tipo = data.tipo;
      }
      if (data.fechaAdquisicion && data.fechaAdquisicion !== equipo.fechaAdquisicion?.split('T')[0]) {
        updates.fechaAdquisicion = data.fechaAdquisicion;
      }

      // Validar que haya al menos un cambio
      if (Object.keys(updates).length === 0) {
        error('No hay cambios para guardar');
        return;
      }

      await updateEquipoMutation.mutateAsync({
        id: equipo.id,
        data: updates,
      });
      
      success('Equipo actualizado correctamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      error(err?.message || 'Error al actualizar el equipo');
    }
  };

  const handleDelete = async () => {
    if (!equipo) return;

    try {
      await deleteEquipoMutation.mutateAsync(equipo.id);
      success('Equipo movido a la papelera');
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
          readableMessage || 'No se puede eliminar el equipo porque tiene mantenimientos pendientes',
          {
            title: 'No se puede eliminar',
            duration: 10000
          }
        );
        setShowDeleteConfirm(false);
      } else {
        error(readableMessage || err?.message || 'Error al eliminar el equipo');
      }
    }
  };

  const handleClose = () => {
    if (!updateEquipoMutation.isPending && !deleteEquipoMutation.isPending) {
      reset();
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!equipo) return null;

  // Footer content con botones
  const footerContent = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={updateEquipoMutation.isPending || deleteEquipoMutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="editar-equipo-form"
        disabled={updateEquipoMutation.isPending || deleteEquipoMutation.isPending}
      >
        {updateEquipoMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={handleClose}
      title="Editar Equipo"
      description={`${equipo.nombre} • ${equipo.numeroSerie}`}
      size="xl"
      footerContent={footerContent}
    >
      <form id="editar-equipo-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Campos editables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de Serie */}
            <div className="space-y-2">
              <Label htmlFor="numeroSerie">Número de Serie</Label>
              <Input
                id="numeroSerie"
                {...register('numeroSerie')}
                placeholder="MS261-2024-001"
                maxLength={EQUIPO_FIELD_LIMITS.numeroSerie}
                className={errors.numeroSerie ? 'border-red-500' : ''}
                disabled={updateEquipoMutation.isPending}
              />
              {errors.numeroSerie && (
                <p className="text-sm text-red-500 mt-1">{errors.numeroSerie.message}</p>
              )}
              <p className="text-sm text-gray-500">
                {(numeroSerieValue?.length || 0)}/{EQUIPO_FIELD_LIMITS.numeroSerie} caracteres
              </p>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Motosierra Stihl #1"
                maxLength={EQUIPO_FIELD_LIMITS.nombre}
                className={errors.nombre ? 'border-red-500' : ''}
                disabled={updateEquipoMutation.isPending}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
              )}
              <p className="text-sm text-gray-500">
                {(nombreValue?.length || 0)}/{EQUIPO_FIELD_LIMITS.nombre} caracteres
              </p>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de equipo</Label>
              <Select
                id="tipo"
                {...register('tipo')}
                className={errors.tipo ? 'border-red-500' : ''}
                disabled={updateEquipoMutation.isPending}
              >
                <option value="">Selecciona un tipo</option>
                {TIPO_EQUIPO_OPTIONS.map((option) => (
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
                disabled={updateEquipoMutation.isPending}
              />
              {errors.fechaAdquisicion && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fechaAdquisicion.message}
                </p>
              )}
            </div>
          </div>

          {/* DangerZone */}
          <DangerZone
            title="Zona de Peligro"
            description="Eliminar este equipo lo moverá a la papelera"
          >
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={updateEquipoMutation.isPending || deleteEquipoMutation.isPending}
              >
                Eliminar equipo
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
                    disabled: deleteEquipoMutation.isPending,
                  },
                ]}
              >
                <AlertDescription>
                  El equipo será movido a la papelera y dejará de aparecer en las listas
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