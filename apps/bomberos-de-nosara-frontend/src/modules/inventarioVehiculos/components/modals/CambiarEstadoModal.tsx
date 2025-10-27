import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';

import { Vehiculo } from '../../../../types/vehiculo.types';
import { EstadoVehiculo } from '../../../../types/vehiculo.types';
import { useUpdateEstadoVehiculo, useDarDeBajaVehiculo } from '../../hooks/useVehiculos';

interface CambiarEstadoModalProps {
  vehiculo: Vehiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  nuevoEstado: EstadoVehiculo | '';
  motivoBaja?: string;
  especificarMotivo?: string;
}

const MOTIVOS_BAJA = [
  'Accidente total',
  'Desgaste por antigüedad',
  'Costo de reparación excede valor',
  'Obsolescencia tecnológica',
  'Donado o transferido',
  'Robado o extraviado',
  'Otro',
] as const;

const ESTADO_LABELS: Record<EstadoVehiculo, string> = {
  [EstadoVehiculo.EN_SERVICIO]: 'En Servicio',
  [EstadoVehiculo.MALO]: 'Malo',
  [EstadoVehiculo.FUERA_DE_SERVICIO]: 'Fuera de Servicio',
  [EstadoVehiculo.BAJA]: 'Dado de Baja',
};

export const CambiarEstadoModal: React.FC<CambiarEstadoModalProps> = ({
  vehiculo,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>();
  
  const updateEstadoMutation = useUpdateEstadoVehiculo();
  const darDeBajaMutation = useDarDeBajaVehiculo();

  const nuevoEstado = watch('nuevoEstado');
  const motivoBaja = watch('motivoBaja');

  const estadoActual = vehiculo?.estadoActual;
  const cambiaABaja = nuevoEstado === EstadoVehiculo.BAJA;
  const cambiaDesdeBAJA = estadoActual === EstadoVehiculo.BAJA && nuevoEstado && nuevoEstado !== EstadoVehiculo.BAJA;
  const esOtroMotivo = motivoBaja === 'Otro';

  useEffect(() => {
    if (open && vehiculo) {
      reset({
        nuevoEstado: '',
        motivoBaja: undefined,
        especificarMotivo: '',
      });
    }
  }, [open, vehiculo, reset]);

  const handleClose = () => {
    if (!updateEstadoMutation.isPending && !darDeBajaMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  const onSubmit = async (data: FormData) => {
  if (!vehiculo || !data.nuevoEstado) return;

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
        id: vehiculo.id,
        motivo: motivoCompleto,
      });
    } else {
      // ✅ CORREGIDO: Envolver en objeto 'data'
      await updateEstadoMutation.mutateAsync({
        id: vehiculo.id,
        data: {
          estadoActual: data.nuevoEstado as EstadoVehiculo,
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
  if (!vehiculo) return null;

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
          <DialogTitle>Cambiar Estado del Vehículo</DialogTitle>
          <DialogDescription>
            Placa: <span className="font-semibold">{vehiculo.placa}</span> | Estado actual:{' '}
            <span className="font-semibold">
              {estadoActual ? ESTADO_LABELS[estadoActual] : 'Sin estado'}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
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
                  ⚠️ Al dar de baja el vehículo, se registrará permanentemente en el historial.
                  Esta acción es reversible.
                </AlertDescription>
              </Alert>
            )}

            {/* Alert: Cambio desde BAJA */}
            {cambiaDesdeBAJA && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  ⚠️ Este vehículo está dado de baja. ¿Confirmas que volverá a estar operativo?
                  Se registrará la restauración en el historial.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!nuevoEstado || updateEstadoMutation.isPending || darDeBajaMutation.isPending}
            >
              {updateEstadoMutation.isPending || darDeBajaMutation.isPending
                ? 'Cambiando...'
                : 'Cambiar Estado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};