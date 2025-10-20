import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Select } from '../../../../components/ui/select';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useAddVehiculo } from '../../hooks/useVehiculos';
import { createVehiculoSchema, VEHICULO_FIELD_LIMITS } from '../../utils/vehiculoValidations';
import type { CreateVehiculoFormData } from '../../utils/vehiculoValidations';
import {
  TIPO_VEHICULO_OPTIONS,
  ESTADO_VEHICULO_OPTIONS,
  ESTADO_INICIAL_OPTIONS,
} from '../../utils/vehiculoHelpers';

interface CrearVehiculoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CrearVehiculoModal: React.FC<CrearVehiculoModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const addVehiculoMutation = useAddVehiculo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateVehiculoFormData>({
    resolver: zodResolver(createVehiculoSchema),
    defaultValues: {
      placa: '',
      tipo: undefined,
      estadoInicial: undefined,
      estadoActual: undefined,
      fechaAdquisicion: '',
      kilometraje: 0,
      observaciones: '',
    },
  });

  const placaValue = watch('placa');

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateVehiculoFormData) => {
    try {
      await addVehiculoMutation.mutateAsync(data);
      success('Vehículo creado correctamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      error(err?.message || 'Error al crear el vehículo');
    }
  };

  const handleClose = () => {
    if (!addVehiculoMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  // Calcular fecha máxima (hoy)
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
          <DialogTitle>Agregar Vehículo</DialogTitle>
          <DialogDescription>
            Registra un nuevo vehículo en la flota de bomberos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placa */}
              <div className="space-y-2">
                <Label htmlFor="placa">
                  Placa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="placa"
                  {...register('placa')}
                  placeholder="Ej: ABC-123"
                  maxLength={VEHICULO_FIELD_LIMITS.placa}
                  className={errors.placa ? 'border-red-500' : ''}
                  disabled={addVehiculoMutation.isPending}
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
                <Label htmlFor="tipo">
                  Tipo de vehículo <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="tipo"
                  {...register('tipo')}
                  className={errors.tipo ? 'border-red-500' : ''}
                  disabled={addVehiculoMutation.isPending}
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

              {/* Estado Inicial */}
              <div className="space-y-2">
                <Label htmlFor="estadoInicial">
                  Estado inicial <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="estadoInicial"
                  {...register('estadoInicial')}
                  className={errors.estadoInicial ? 'border-red-500' : ''}
                  disabled={addVehiculoMutation.isPending}
                >
                  <option value="">Selecciona un estado</option>
                  {ESTADO_INICIAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.estadoInicial && (
                  <p className="text-sm text-red-500 mt-1">{errors.estadoInicial.message}</p>
                )}
              </div>

              {/* Estado Actual */}
              <div className="space-y-2">
                <Label htmlFor="estadoActual">
                  Estado actual <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="estadoActual"
                  {...register('estadoActual')}
                  className={errors.estadoActual ? 'border-red-500' : ''}
                  disabled={addVehiculoMutation.isPending}
                >
                  <option value="">Selecciona un estado</option>
                  {ESTADO_VEHICULO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.estadoActual && (
                  <p className="text-sm text-red-500 mt-1">{errors.estadoActual.message}</p>
                )}
              </div>

              {/* Fecha de Adquisición */}
              <div className="space-y-2">
                <Label htmlFor="fechaAdquisicion">
                  Fecha de adquisición <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fechaAdquisicion"
                  type="date"
                  max={getMaxDate()}
                  {...register('fechaAdquisicion')}
                  className={errors.fechaAdquisicion ? 'border-red-500' : ''}
                  disabled={addVehiculoMutation.isPending}
                />
                {errors.fechaAdquisicion && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.fechaAdquisicion.message}
                  </p>
                )}
              </div>

              {/* Kilometraje */}
              <div className="space-y-2">
                <Label htmlFor="kilometraje">
                  Kilometraje (km) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kilometraje"
                  type="number"
                  {...register('kilometraje', { 
                    valueAsNumber: true,
                  })}
                  placeholder="Ej: 15000"
                  min="0"
                  max={VEHICULO_FIELD_LIMITS.kilometraje}
                  className={errors.kilometraje ? 'border-red-500' : ''}
                  disabled={addVehiculoMutation.isPending}
                />
                {errors.kilometraje && (
                  <p className="text-sm text-red-500 mt-1">{errors.kilometraje.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addVehiculoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addVehiculoMutation.isPending}>
              {addVehiculoMutation.isPending ? 'Guardando...' : 'Guardar vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};