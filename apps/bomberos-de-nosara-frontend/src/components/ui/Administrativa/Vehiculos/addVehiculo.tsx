import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddVehiculo } from '../../../../hooks/useVehiculos';

// Importa SOLO el tipo para el formulario
import type { Vehicle } from '../../../../interfaces/Vehiculos/vehicle';

interface AddVehicleProps {
  onSuccess?: () => void;
}

type FormValues = Omit<Vehicle, 'id'>;

const todayISO = new Date().toISOString().slice(0, 10);

// Límite de caracteres para observaciones
const OBS_MAX = 150;
// Tiempo para dejar visible el banner antes de cerrar
const SUCCESS_HOLD_MS = 3000;

/** Opciones con alias:
 *  - "Lancha de rescate" -> value 'ambulancia'
 *  - "Cuadraciclo de Patrullaje de Playa" -> value 'camión'
 *  Los demás valores coinciden con tu enum TipoVehiculo en minúscula.
 */
type TV = Vehicle['tipo'];
const TIPO_OPTIONS: { value: TV; label: string }[] = [
  
  
  { value: 'pickup' as TV, label: 'Pickup' },
  { value: 'ambulancia' as TV, label: 'Lancha de rescate' },                 // alias de Ambulancia
  { value: 'camión' as TV, label: 'Cuadraciclo de Patrullaje de Playa' },    // alias de Camión
  { value: 'moto' as TV, label: 'Moto acuática de rescate' },                // si usas 'moto' en el enum
  { value: 'vehículo utilitario' as TV, label: 'Vehículo utilitario' },
  { value: 'otro' as TV, label: 'Otro' },
];

type EV = Vehicle['estadoActual'];
const ESTADO_OPTIONS: { value: EV; label: string }[] = [
  { value: 'activo' as EV, label: 'Activo' },
  { value: 'en mantenimiento' as EV, label: 'En mantenimiento' },
  { value: 'dado de baja' as EV, label: 'Dado de baja' },
];

// ---------- Banner visible arriba ----------
function NoticeBanner({
  type,
  text,
  onClose,
}: {
  type: 'success' | 'error';
  text: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[min(92vw,680px)]">
      <div className="relative overflow-hidden rounded-xl border bg-white/95 backdrop-blur shadow-2xl ring-1 ring-black/5">
        {/* barra superior de color */}
        <div className={`absolute inset-x-0 top-0 h-1 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
        <div className="flex items-start gap-3 p-4">
          {/* icono */}
          {isSuccess ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m22 4-10 10-3-3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4m0 4h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          )}

          <div className="text-sm">
            <p className={`font-semibold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {isSuccess ? '¡Vehículo registrado!' : 'Ocurrió un error'}
            </p>
            <p className="text-slate-700">{text}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-slate-600 text-lg leading-none px-1"
            aria-label="Cerrar notificación"
            title="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
// ------------------------------------------

export default function AddVehiculo({ onSuccess }: AddVehicleProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch, // para contador
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onChange' });

  const addVehiculo = useAddVehiculo();

  // estado del banner
  const [notice, setNotice] = useState<null | { type: 'success' | 'error'; text: string }>(null);

  // valor y longitud actuales de observaciones
  const obsLen = (watch('observaciones') ?? '').length;

  const onSubmit = (data: FormValues) => {
    const payload: FormValues = { ...data, placa: data.placa?.trim() };

    addVehiculo.mutate(payload, {
      onSuccess: () => {
        setNotice({ type: 'success', text: 'El vehículo se agregó correctamente.' });
        // Dejar ver el banner y luego reset/cerrar
        setTimeout(() => {
          reset();
          onSuccess?.();
        }, SUCCESS_HOLD_MS);
      },
      onError: (e: any) => {
        const code = e?.code || e?.response?.data?.code;
        const message = e?.message || e?.response?.data?.message || 'Error al registrar vehículo';
        if (code === 'PLATE_EXISTS') {
          setError('placa', { type: 'server', message: message || 'La placa ya está registrada' });
        }
        setNotice({ type: 'error', text: message });
      },
    });
  };

  return (
    <>
      {notice && (
        <NoticeBanner
          type={notice.type}
          text={notice.text}
          onClose={() => setNotice(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label>Tipo de vehículo</label>
          <select
            {...register('tipo', { required: 'El tipo es requerido' })}
            className="input w-full"
          >
            <option value="">-- Selecciona tipo --</option>
            {TIPO_OPTIONS.map((o) => (
              <option key={`${o.value}-${o.label}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.tipo && <p className="text-red-600 text-sm mt-1">{errors.tipo.message as string}</p>}
        </div>

        <div>
          <label>Placa</label>
          <input
            {...register('placa', {
              required: 'La placa es requerida',
              minLength: { value: 3, message: 'La placa debe tener al menos 3 caracteres' },
            })}
            className="input w-full"
          />
          {errors.placa && <p className="text-red-600 text-sm mt-1">{errors.placa.message as string}</p>}
        </div>

        <div>
          <label>Estado inicial</label>
          <select
            {...register('estadoInicial', { required: 'El estado inicial es requerido' })}
            className="input w-full"
          >
            <option value="">-- Selecciona estado --</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
          </select>
          {errors.estadoInicial && <p className="text-red-600 text-sm mt-1">{errors.estadoInicial.message as string}</p>}
        </div>

        <div>
          <label>Estado actual</label>
          <select
            {...register('estadoActual', { required: 'El estado actual es requerido' })}
            className="input w-full"
          >
            <option value="">-- Selecciona estado --</option>
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.estadoActual && <p className="text-red-600 text-sm mt-1">{errors.estadoActual.message as string}</p>}
        </div>

        <div>
          <label>Fecha de adquisición</label>
          <input
            type="date"
            max={todayISO}
            {...register('fechaAdquisicion', {
              required: 'La fecha de adquisición es requerida',
              validate: (value) => {
                if (!value) return 'La fecha de adquisición es requerida';
                return value <= todayISO || 'La fecha de adquisición no puede ser mayor a hoy';
              },
            })}
            className="input w-full"
          />
          {errors.fechaAdquisicion && (
            <p className="text-red-600 text-sm mt-1">{errors.fechaAdquisicion.message as string}</p>
          )}
        </div>

        <div>
          <label>Kilometraje</label>
          <input
            type="number"
            {...register('kilometraje', {
              required: 'El kilometraje es importante y es requerido',
              valueAsNumber: true,
              min: { value: 0, message: 'El kilometraje no puede ser negativo' },
              validate: (v) =>
                (v !== undefined && v !== null && !Number.isNaN(v)) || 'El kilometraje debe ser un número válido',
            })}
            className="input w-full"
          />
          {errors.kilometraje && <p className="text-red-600 text-sm mt-1">{errors.kilometraje.message as string}</p>}
        </div>

        <div className="md:col-span-2">
          <label>URL de foto (opcional)</label>
          <input
            {...register('fotoUrl', {
              validate: (v) => !v || /^https?:\/\/.+/i.test(v) || 'Debe ser una URL válida (http/https)',
            })}
            className="input w-full"
          />
          {errors.fotoUrl && <p className="text-red-600 text-sm mt-1">{errors.fotoUrl.message as string}</p>}
        </div>

        {/* Observaciones con el mismo patrón que Equipo (mensaje + contador abajo) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" htmlFor="observaciones">
            Observaciones (opcional)
          </label>

          <textarea
            id="observaciones"
            className={`input w-full ${errors.observaciones ? 'ring-1 ring-red-500' : ''}`}
            rows={3}
            maxLength={OBS_MAX}
            {...register('observaciones', {
              maxLength: { value: OBS_MAX, message: `Máximo ${OBS_MAX} caracteres` },
            })}
          />

          <div className="mt-1 flex items-center justify-between">
            {(obsLen >= OBS_MAX || !!errors.observaciones) ? (
              <p className="text-red-600 text-sm">Máximo {OBS_MAX} caracteres</p>
            ) : <span />}
            <span className="text-xs text-slate-400">
              {obsLen}/{OBS_MAX}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            disabled={addVehiculo.isPending}
            className={`px-6 py-2 rounded text-white ${addVehiculo.isPending ? 'bg-green-600/60' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {addVehiculo.isPending ? 'Guardando…' : 'Registrar vehículo'}
          </button>
        </div>
      </form>
    </>
  );
}
