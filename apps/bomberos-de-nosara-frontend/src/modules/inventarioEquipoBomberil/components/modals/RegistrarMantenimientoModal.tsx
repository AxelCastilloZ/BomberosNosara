// src/modules/inventarioEquipos/components/modals/RegistrarMantenimientoModal.tsx

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
import { useEquipos } from '../../hooks/useEquipos';
import { useRegistrarMantenimiento } from '../../hooks/useMantenimientos';
import { getTipoEquipoLabel } from '../../utils/equipoBomberilHelpers';
import { registrarMantenimientoSchema, EQUIPO_FIELD_LIMITS } from '../../utils/equipoBomberilValidations';
import type { RegistrarMantenimientoFormData } from '../../utils/equipoBomberilValidations';
import type { EquipoBomberil } from '../../../../types/equipoBomberil.types';
import { TipoMantenimiento } from '../../../../types/mantenimientoEquipo.types';

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
  const { data: equiposResponse, isLoading: isLoadingEquipos } = useEquipos();

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
    watch,
    reset,
  } = useForm<RegistrarMantenimientoFormData>({
    resolver: zodResolver(registrarMantenimientoSchema),
    defaultValues: {
      equipoId: '',
      tipo: TipoMantenimiento.CORRECTIVO,
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      tecnico: '',
      costo: 0,
      observaciones: '',
    },
  });

  const equipoIdSeleccionado = watch('equipoId');
  const descripcionValue = watch('descripcion');
  const tecnicoValue = watch('tecnico');
  const observacionesValue = watch('observaciones');

  const equipoSeleccionado = equipos.find((e) => e.id === equipoIdSeleccionado);

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        equipoId: '',
        tipo: TipoMantenimiento.CORRECTIVO,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        tecnico: '',
        costo: 0,
        observaciones: '',
      });
    }
  }, [open, reset]);

  // ==================== HANDLERS ====================

  const onSubmit = async (data: RegistrarMantenimientoFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await registrarMutation.mutateAsync({
        equipoId: data.equipoId,
        data: {
          tipo: data.tipo,
          fecha: data.fecha,
          descripcion: data.descripcion,
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
        form="registrar-mantenimiento-form"
        disabled={isSubmitting || isLoadingEquipos}
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
      <form id="registrar-mantenimiento-form" onSubmit={handleSubmit(onSubmit)}>
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
              {equipos.map((equipo) => (
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
              maxLength={EQUIPO_FIELD_LIMITS.descripcion}
              placeholder="Ej: Cambio de filtro de aire y ajuste de cadena"
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

          {/* Grid 2 columnas: Técnico y Costo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Técnico */}
            <div className="space-y-2">
              <Label htmlFor="tecnico">
                Técnico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tecnico"
                type="text"
                maxLength={EQUIPO_FIELD_LIMITS.tecnico}
                placeholder="Nombre del técnico"
                {...register('tecnico')}
                className={errors.tecnico ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.tecnico && (
                <p className="text-sm text-red-500 mt-1">{errors.tecnico.message}</p>
              )}
              <p className="text-sm text-gray-500">
                {(tecnicoValue?.length || 0)}/{EQUIPO_FIELD_LIMITS.tecnico} caracteres
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
                step="0.01"
                min="0"
                max={EQUIPO_FIELD_LIMITS.costo}
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
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              rows={3}
              maxLength={EQUIPO_FIELD_LIMITS.observacionesMantenimiento}
              placeholder="Notas adicionales sobre el mantenimiento..."
              {...register('observaciones')}
              disabled={isSubmitting}
            />
            {errors.observaciones && (
              <p className="text-sm text-red-500 mt-1">{errors.observaciones.message}</p>
            )}
            <p className="text-sm text-gray-500">
              {(observacionesValue?.length || 0)}/{EQUIPO_FIELD_LIMITS.observacionesMantenimiento} caracteres
            </p>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};