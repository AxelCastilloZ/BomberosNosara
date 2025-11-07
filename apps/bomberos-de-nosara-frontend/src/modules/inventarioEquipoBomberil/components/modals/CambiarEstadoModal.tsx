// src/modules/inventarioEquipos/components/modals/CambiarEstadoModal.tsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BaseModal } from '../../../../components/ui/base-modal';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';

import { EquipoBomberil } from '../../../../types/equipoBomberil.types';
import { EstadoEquipo } from '../../../../types/equipoBomberil.types';
import { useUpdateEstadoEquipo, useDarDeBajaEquipo } from '../../hooks/useEquipos';

interface CambiarEstadoModalProps {
  equipo: EquipoBomberil | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  nuevoEstado: EstadoEquipo | '';
  motivoBaja?: string;
  especificarMotivo?: string;
}

const MOTIVOS_BAJA = [
  'Desgaste por uso intensivo',
  'Daño irreparable',
  'Obsoleto / Reemplazado',
  'Robado o extraviado',
  'Donado o transferido',
  'Falla mecánica crítica',
  'Otro',
] as const;

const ESTADO_LABELS: Record<EstadoEquipo, string> = {
  [EstadoEquipo.EN_SERVICIO]: 'En Servicio',
  [EstadoEquipo.MALO]: 'Malo',
  [EstadoEquipo.FUERA_DE_SERVICIO]: 'Fuera de Servicio',
  [EstadoEquipo.BAJA]: 'Dado de Baja',
};

export const CambiarEstadoModal: React.FC<CambiarEstadoModalProps> = ({
  equipo,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>();
  
  const updateEstadoMutation = useUpdateEstadoEquipo();
  const darDeBajaMutation = useDarDeBajaEquipo();

  const nuevoEstado = watch('nuevoEstado');
  const motivoBaja = watch('motivoBaja');

  const estadoActual = equipo?.estadoActual;
  const cambiaABaja = nuevoEstado === EstadoEquipo.BAJA;
  const cambiaDesdeBAJA = estadoActual === EstadoEquipo.BAJA && nuevoEstado && nuevoEstado !== EstadoEquipo.BAJA;
  const esOtroMotivo = motivoBaja === 'Otro';

  useEffect(() => {
    if (open && equipo) {
      reset({
        nuevoEstado: '',
        motivoBaja: undefined,
        especificarMotivo: '',
      });
    }
  }, [open, equipo, reset]);

  const handleClose = () => {
    if (!updateEstadoMutation.isPending && !darDeBajaMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!equipo || !data.nuevoEstado) return;

    // Validación: No permitir cambiar al mismo estado
    if (data.nuevoEstado === estadoActual) {
      error(`El equipo ya está en estado: ${ESTADO_LABELS[estadoActual]}`, {
        title: 'Estado sin cambios',
        duration: 5000
      });
      return;
    }

    try {
      if (cambiaABaja) {
        // Validar motivo
        if (!data.motivoBaja) {
          error('Debe seleccionar un motivo de baja');
          return;
        }

        let motivoCompleto = data.motivoBaja;
        if (data.motivoBaja === 'Otro') {
          if (!data.especificarMotivo || data.especificarMotivo.trim().length < 10) {
            error('Debe especificar el motivo con al menos 10 caracteres');
            return;
          }
          motivoCompleto = data.especificarMotivo.trim();
        }

        await darDeBajaMutation.mutateAsync({
          id: equipo.id,
          motivo: motivoCompleto,
        });
      } else {
        await updateEstadoMutation.mutateAsync({
          id: equipo.id,
          data: {
            estadoActual: data.nuevoEstado as EstadoEquipo,
          },
        });
      }

      success('Estado actualizado correctamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      error(err?.message || 'Error al cambiar el estado');
    }
  };

  if (!equipo) return null;

  // Footer content con botones
  const footerContent = (
    <>
      <Button type="button" variant="outline" onClick={handleClose}>
        Cancelar
      </Button>
      <Button
        type="submit"
        form="cambiar-estado-equipo-form"
        disabled={!nuevoEstado || updateEstadoMutation.isPending || darDeBajaMutation.isPending}
      >
        {updateEstadoMutation.isPending || darDeBajaMutation.isPending
          ? 'Cambiando...'
          : 'Cambiar Estado'}
      </Button>
    </>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={handleClose}
      title="Cambiar Estado del Equipo"
      description={`${equipo.nombre} • Estado actual: ${
        estadoActual ? ESTADO_LABELS[estadoActual] : 'Sin estado'
      }`}
      size="md"
      footerContent={footerContent}
    >
      <form id="cambiar-estado-equipo-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Select Nuevo Estado */}
          <div>
            <Label htmlFor="nuevoEstado">
              Nuevo Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              id="nuevoEstado"
              {...register('nuevoEstado', { required: 'Debe seleccionar un estado' })}
              className={errors.nuevoEstado ? 'border-red-500' : ''}
            >
              <option value="">Seleccione un estado</option>
              {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {errors.nuevoEstado && (
              <p className="text-sm text-red-500 mt-1">{errors.nuevoEstado.message}</p>
            )}
          </div>

          {/* Select Motivo de Baja */}
          {cambiaABaja && (
            <div>
              <Label htmlFor="motivoBaja">
                Motivo de Baja <span className="text-red-500">*</span>
              </Label>
              <Select
                id="motivoBaja"
                {...register('motivoBaja', { required: cambiaABaja })}
                className={errors.motivoBaja ? 'border-red-500' : ''}
              >
                <option value="">Seleccione un motivo</option>
                {MOTIVOS_BAJA.map((motivo) => (
                  <option key={motivo} value={motivo}>
                    {motivo}
                  </option>
                ))}
              </Select>
              {errors.motivoBaja && (
                <p className="text-sm text-red-500 mt-1">Debe seleccionar un motivo</p>
              )}
            </div>
          )}

          {/* Textarea Especificar Motivo */}
          {cambiaABaja && esOtroMotivo && (
            <div>
              <Label htmlFor="especificarMotivo">
                Especificar Motivo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="especificarMotivo"
                placeholder="Describa el motivo de la baja..."
                rows={3}
                {...register('especificarMotivo')}
                className={errors.especificarMotivo ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
            </div>
          )}

          {/* Alert: Cambio a BAJA */}
          {cambiaABaja && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Al dar de baja el equipo, se registrará permanentemente en el historial.
                Esta acción es reversible.
              </AlertDescription>
            </Alert>
          )}

          {/* Alert: Cambio desde BAJA */}
          {cambiaDesdeBAJA && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Este equipo está dado de baja. ¿Confirmas que volverá a estar operativo?
                Se registrará la restauración en el historial.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </form>
    </BaseModal>
  );
};