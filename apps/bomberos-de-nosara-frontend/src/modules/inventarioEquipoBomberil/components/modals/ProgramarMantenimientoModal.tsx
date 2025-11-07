// src/modules/inventarioEquipos/components/modals/ProgramarMantenimientoModal.tsx

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
import { useEquipos } from '../../hooks/useEquipos';
import { useProgramarMantenimiento } from '../../hooks/useMantenimientos';
import { getTipoEquipoLabel } from '../../utils/equipoBomberilHelpers';
import { programarMantenimientoSchema, EQUIPO_FIELD_LIMITS } from '../../utils/equipoBomberilValidations';
import type { ProgramarMantenimientoFormData } from '../../utils/equipoBomberilValidations';
import type { ProgramarMantenimientoModalProps } from '../../types';
import type { EquipoBomberil } from '../../../../types/equipoBomberil.types';
import { TipoMantenimiento } from '../../../../types/mantenimientoEquipo.types';

export const ProgramarMantenimientoModal: React.FC<ProgramarMantenimientoModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: equiposResponse, isLoading: isLoadingEquipos } = useEquipos();
  const programarMutation = useProgramarMantenimiento();

  // Extraer equipos de forma segura
  const equipos: EquipoBomberil[] = (() => {
    if (!equiposResponse) return [];
    if (Array.isArray(equiposResponse)) return equiposResponse;
    if ('data' in equiposResponse) return (equiposResponse as any).data || [];
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
      equipoId: '',
      tipo: TipoMantenimiento.PREVENTIVO,
      fecha: '',
      descripcion: '',
      observaciones: '',
    },
  });

  const equipoSeleccionadoId = watch('equipoId');
  const descripcionValue = watch('descripcion');
  const observacionesValue = watch('observaciones');

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

  // Obtener info del equipo seleccionado
  const equipoSeleccionado = equipos.find((e: EquipoBomberil) => e.id === equipoSeleccionadoId);

  // ==================== HANDLERS ====================

  const onSubmit = async (data: ProgramarMantenimientoFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await programarMutation.mutateAsync({
        equipoId: data.equipoId,
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
        form="programar-mantenimiento-form"
        disabled={isSubmitting || isLoadingEquipos}
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
      description="Agenda un mantenimiento futuro para un equipo"
      size="xl"
      footerContent={footerContent}
    >
      <form id="programar-mantenimiento-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Equipo */}
          <div className="space-y-2">
            <Label htmlFor="equipoId">
              Equipo <span className="text-red-500">*</span>
            </Label>
            <Select
              id="equipoId"
              {...register('equipoId')}
              className={errors.equipoId ? 'border-red-500' : ''}
              disabled={isLoadingEquipos || isSubmitting}
            >
              <option value="">Selecciona un equipo</option>
              {equipos.map((equipo: EquipoBomberil) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre} - {getTipoEquipoLabel(equipo.tipo)}
                </option>
              ))}
            </Select>
            {errors.equipoId && (
              <p className="text-sm text-red-500 mt-1">{errors.equipoId.message}</p>
            )}
            {equipoSeleccionado && (
              <p className="text-sm text-gray-500 mt-1">
                N° Serie: {equipoSeleccionado.numeroSerie}
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
              maxLength={EQUIPO_FIELD_LIMITS.descripcion}
              placeholder="Ej: Revisión general y cambio de aceite"
              {...register('descripcion')}
              className={errors.descripcion ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500 mt-1">{errors.descripcion.message}</p>
            )}
            <p className="text-sm text-gray-500">
              {(descripcionValue?.length || 0)}/{EQUIPO_FIELD_LIMITS.descripcion} caracteres
            </p>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              rows={3}
              maxLength={EQUIPO_FIELD_LIMITS.observaciones}
              placeholder="Notas adicionales sobre el mantenimiento programado..."
              {...register('observaciones')}
              disabled={isSubmitting}
            />
            {errors.observaciones && (
              <p className="text-sm text-red-500 mt-1">{errors.observaciones.message}</p>
            )}
            <p className="text-sm text-gray-500">
              {(observacionesValue?.length || 0)}/{EQUIPO_FIELD_LIMITS.observaciones} caracteres
            </p>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};