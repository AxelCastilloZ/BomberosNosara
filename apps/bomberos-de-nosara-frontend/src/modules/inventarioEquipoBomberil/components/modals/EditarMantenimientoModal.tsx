



import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useEditMantenimiento } from '../../hooks/useMantenimientos';
import type { MantenimientoEquipo } from '../../../../types/mantenimientoEquipo.types';

// Schema de validación
const editMantenimientoSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(500),
  fecha: z.string().min(1, 'La fecha es requerida'),
  observaciones: z.string().max(1000).optional(),
  tecnico: z.string().max(200).optional(),
  costo: z.number().min(0, 'El costo no puede ser negativo').optional(),
});

type EditMantenimientoFormData = z.infer<typeof editMantenimientoSchema>;

interface EditarMantenimientoModalProps {
  mantenimiento: MantenimientoEquipo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditarMantenimientoModal: React.FC<EditarMantenimientoModalProps> = ({
  mantenimiento,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const editMantenimientoMutation = useEditMantenimiento();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditMantenimientoFormData>({
    resolver: zodResolver(editMantenimientoSchema),
  });

  const descripcionValue = watch('descripcion');
  const observacionesValue = watch('observaciones');

  useEffect(() => {
    if (open && mantenimiento) {
      reset({
        descripcion: mantenimiento.descripcion,
        fecha: mantenimiento.fecha?.split('T')[0] || '',
        observaciones: mantenimiento.observaciones || '',
        tecnico: mantenimiento.tecnico || '',
        costo: mantenimiento.costo || undefined,
      });
    }
  }, [open, mantenimiento, reset]);

  const onSubmit = async (data: EditMantenimientoFormData) => {
    if (!mantenimiento) return;

    try {
      // Construir objeto solo con campos que cambiaron
      const updates: any = {};
      
      if (data.descripcion !== mantenimiento.descripcion) {
        updates.descripcion = data.descripcion;
      }
      if (data.fecha !== mantenimiento.fecha?.split('T')[0]) {
        updates.fecha = data.fecha;
      }
      if (data.observaciones !== (mantenimiento.observaciones || '')) {
        updates.observaciones = data.observaciones || '';
      }
      if (data.tecnico !== (mantenimiento.tecnico || '')) {
        updates.tecnico = data.tecnico || '';
      }
      if (data.costo !== mantenimiento.costo) {
        updates.costo = data.costo;
      }

      // Validar que haya al menos un cambio
      if (Object.keys(updates).length === 0) {
        error('No hay cambios para guardar');
        return;
      }

      await editMantenimientoMutation.mutateAsync({
        mantenimientoId: mantenimiento.id,
        data: updates,
        equipoId: mantenimiento.equipoId,
      });
      
      success('Mantenimiento actualizado correctamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message;
      error(errorMessage || err?.message || 'Error al actualizar el mantenimiento');
    }
  };

  const handleClose = () => {
    if (!editMantenimientoMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!mantenimiento) return null;

  const esCompletado = mantenimiento.estado === 'completado';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[95vw] max-w-2xl"
        style={{
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Editar Mantenimiento</DialogTitle>
          <DialogDescription>
            {mantenimiento.equipo?.nombre || 'Equipo'} • {mantenimiento.equipo?.numeroSerie || ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Ej: Cambio de aceite y filtros"
                maxLength={500}
                rows={3}
                className={errors.descripcion ? 'border-red-500' : ''}
                disabled={editMantenimientoMutation.isPending}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-500">{errors.descripcion.message}</p>
              )}
              <p className="text-sm text-gray-500">
                {(descripcionValue?.length || 0)}/500 caracteres
              </p>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fecha"
                type="date"
                max={getMaxDate()}
                {...register('fecha')}
                className={errors.fecha ? 'border-red-500' : ''}
                disabled={editMantenimientoMutation.isPending}
              />
              {errors.fecha && (
                <p className="text-sm text-red-500">{errors.fecha.message}</p>
              )}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                {...register('observaciones')}
                placeholder="Observaciones adicionales..."
                maxLength={1000}
                rows={3}
                className={errors.observaciones ? 'border-red-500' : ''}
                disabled={editMantenimientoMutation.isPending}
              />
              {errors.observaciones && (
                <p className="text-sm text-red-500">{errors.observaciones.message}</p>
              )}
              <p className="text-sm text-gray-500">
                {(observacionesValue?.length || 0)}/1000 caracteres
              </p>
            </div>

            {/* Técnico - Solo si está completado */}
            {esCompletado && (
              <div className="space-y-2">
                <Label htmlFor="tecnico">Técnico</Label>
                <Input
                  id="tecnico"
                  {...register('tecnico')}
                  placeholder="Nombre del técnico"
                  maxLength={200}
                  className={errors.tecnico ? 'border-red-500' : ''}
                  disabled={editMantenimientoMutation.isPending}
                />
                {errors.tecnico && (
                  <p className="text-sm text-red-500">{errors.tecnico.message}</p>
                )}
              </div>
            )}

            {/* Costo - Solo si está completado */}
            {esCompletado && (
              <div className="space-y-2">
                <Label htmlFor="costo">Costo (₡)</Label>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('costo', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.costo ? 'border-red-500' : ''}
                  disabled={editMantenimientoMutation.isPending}
                />
                {errors.costo && (
                  <p className="text-sm text-red-500">{errors.costo.message}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={editMantenimientoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={editMantenimientoMutation.isPending}
            >
              {editMantenimientoMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};