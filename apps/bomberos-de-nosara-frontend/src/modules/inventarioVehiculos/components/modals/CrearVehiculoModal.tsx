import React from 'react';
import { useForm } from 'react-hook-form';
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
import { useAddVehiculo } from '../../hooks/useVehiculos';
import { VEHICULO_FIELD_LIMITS } from '../../utils/vehiculoValidations';
import {
  TIPO_VEHICULO_OPTIONS,
  ESTADO_VEHICULO_OPTIONS,
  ESTADO_INICIAL_OPTIONS,
} from '../../utils/vehiculoHelpers';
import type { CreateVehiculoDto } from '../../../../types/vehiculo.types';

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
  const addVehiculoMutation = useAddVehiculo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateVehiculoDto>();

  const onSubmit = async (data: CreateVehiculoDto) => {
    try {
      await addVehiculoMutation.mutateAsync(data);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear vehículo:', error);
    }
  };

  const handleClose = () => {
    if (!addVehiculoMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Agregar Vehículo</DialogTitle>
          <DialogDescription>
            Registra un nuevo vehículo en la flota de bomberos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {/* Placa */}
              <div>
                <Label htmlFor="placa">
                  Placa <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="placa"
                  {...register('placa', { required: 'La placa es obligatoria' })}
                  placeholder="ABC-123"
                  maxLength={VEHICULO_FIELD_LIMITS.placa}
                  className={errors.placa ? 'border-red-500' : ''}
                />
                {errors.placa && (
                  <p className="text-sm text-red-600 mt-1">{errors.placa.message}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <Label htmlFor="tipo">
                  Tipo de vehículo <span className="text-red-600">*</span>
                </Label>
                <Select
                  id="tipo"
                  {...register('tipo', { required: 'Selecciona un tipo' })}
                  className={errors.tipo ? 'border-red-500' : ''}
                >
                  <option value="">Selecciona un tipo</option>
                  {TIPO_VEHICULO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-red-600 mt-1">{errors.tipo.message}</p>
                )}
              </div>

              {/* Estado Inicial */}
              <div>
                <Label htmlFor="estadoInicial">
                  Estado inicial <span className="text-red-600">*</span>
                </Label>
                <Select
                  id="estadoInicial"
                  {...register('estadoInicial', { required: 'Selecciona un estado' })}
                  className={errors.estadoInicial ? 'border-red-500' : ''}
                >
                  <option value="">Selecciona un estado</option>
                  {ESTADO_INICIAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.estadoInicial && (
                  <p className="text-sm text-red-600 mt-1">{errors.estadoInicial.message}</p>
                )}
              </div>

              {/* Estado Actual */}
              <div>
                <Label htmlFor="estadoActual">
                  Estado actual <span className="text-red-600">*</span>
                </Label>
                <Select
                  id="estadoActual"
                  {...register('estadoActual', { required: 'Selecciona un estado' })}
                  className={errors.estadoActual ? 'border-red-500' : ''}
                >
                  <option value="">Selecciona un estado</option>
                  {ESTADO_VEHICULO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.estadoActual && (
                  <p className="text-sm text-red-600 mt-1">{errors.estadoActual.message}</p>
                )}
              </div>

              {/* Fecha de Adquisición */}
              <div>
                <Label htmlFor="fechaAdquisicion">
                  Fecha de adquisición <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="fechaAdquisicion"
                  type="date"
                  {...register('fechaAdquisicion', { required: 'La fecha es obligatoria' })}
                  className={errors.fechaAdquisicion ? 'border-red-500' : ''}
                />
                {errors.fechaAdquisicion && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.fechaAdquisicion.message}
                  </p>
                )}
              </div>

              {/* Kilometraje */}
              <div>
                <Label htmlFor="kilometraje">
                  Kilometraje (km) <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="kilometraje"
                  type="number"
                  {...register('kilometraje', { 
                    required: 'El kilometraje es obligatorio',
                    valueAsNumber: true,
                    min: { value: 0, message: 'El kilometraje no puede ser negativo' }
                  })}
                  placeholder="0"
                  min="0"
                  max={VEHICULO_FIELD_LIMITS.kilometraje}
                  className={errors.kilometraje ? 'border-red-500' : ''}
                />
                {errors.kilometraje && (
                  <p className="text-sm text-red-600 mt-1">{errors.kilometraje.message}</p>
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