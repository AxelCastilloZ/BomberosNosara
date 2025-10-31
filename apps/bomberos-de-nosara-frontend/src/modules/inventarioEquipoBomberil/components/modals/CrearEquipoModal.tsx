// src/modules/inventarioEquipos/components/modals/CrearEquipoModal.tsx

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
import { useAddEquipo } from '../../hooks/useEquipos';
import { createEquipoSchema, EQUIPO_FIELD_LIMITS } from '../../utils/equipoBomberilValidations';
import type { CreateEquipoFormData } from '../../utils/equipoBomberilValidations';
import {
  TIPO_EQUIPO_OPTIONS,
  ESTADO_EQUIPO_OPTIONS,
  ESTADO_INICIAL_OPTIONS,
} from '../../utils/equipoBomberilHelpers';

interface CrearEquipoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CrearEquipoModal: React.FC<CrearEquipoModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { success, error } = useNotifications();
  const addEquipoMutation = useAddEquipo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateEquipoFormData>({
    resolver: zodResolver(createEquipoSchema),
    defaultValues: {
      numeroSerie: '',
      nombre: '',
      tipo: undefined,
      estadoInicial: undefined,
      estadoActual: undefined,
      fechaAdquisicion: '',
      observaciones: '',
    },
  });

  const numeroSerieValue = watch('numeroSerie');
  const nombreValue = watch('nombre');

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateEquipoFormData) => {
    try {
      await addEquipoMutation.mutateAsync(data);
      success('Equipo creado correctamente');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      // 🔥 La estructura correcta del error del backend
      const errorCode = err?.response?.data?.code;
      const errorMessage = err?.response?.data?.message;
      
      // Mostrar el mensaje apropiado
      if (errorCode === 'DUPLICATE_KEY') {
        error(
          errorMessage || 'Este número de serie ya está registrado. Use uno diferente.',
          {
            title: 'Número de serie duplicado',
            duration: 8000
          }
        );
      } else {
        error(errorMessage || err?.message || 'Error al crear el equipo');
      }
    }
  };

  const handleClose = () => {
    if (!addEquipoMutation.isPending) {
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
          <DialogTitle>Agregar Equipo</DialogTitle>
          <DialogDescription>
            Registra un nuevo equipo en el inventario de bomberos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de Serie */}
              <div className="space-y-2">
                <Label htmlFor="numeroSerie">
                  Número de Serie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numeroSerie"
                  {...register('numeroSerie')}
                  placeholder="Ej: MS261-2024-001"
                  maxLength={EQUIPO_FIELD_LIMITS.numeroSerie}
                  className={errors.numeroSerie ? 'border-red-500' : ''}
                  disabled={addEquipoMutation.isPending}
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
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  {...register('nombre')}
                  placeholder="Ej: Motosierra Stihl #1"
                  maxLength={EQUIPO_FIELD_LIMITS.nombre}
                  className={errors.nombre ? 'border-red-500' : ''}
                  disabled={addEquipoMutation.isPending}
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
                <Label htmlFor="tipo">
                  Tipo de equipo <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="tipo"
                  {...register('tipo')}
                  className={errors.tipo ? 'border-red-500' : ''}
                  disabled={addEquipoMutation.isPending}
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

              {/* Estado Inicial */}
              <div className="space-y-2">
                <Label htmlFor="estadoInicial">
                  Estado inicial <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="estadoInicial"
                  {...register('estadoInicial')}
                  className={errors.estadoInicial ? 'border-red-500' : ''}
                  disabled={addEquipoMutation.isPending}
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
                  disabled={addEquipoMutation.isPending}
                >
                  <option value="">Selecciona un estado</option>
                  {ESTADO_EQUIPO_OPTIONS.map((option) => (
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
                  disabled={addEquipoMutation.isPending}
                />
                {errors.fechaAdquisicion && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.fechaAdquisicion.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addEquipoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addEquipoMutation.isPending}>
              {addEquipoMutation.isPending ? 'Guardando...' : 'Guardar equipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};