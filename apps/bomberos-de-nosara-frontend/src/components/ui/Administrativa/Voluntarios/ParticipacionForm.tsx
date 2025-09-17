import { useState } from "react";
import { useCrearParticipacion } from "../../../../hooks/useVoluntarios";
import { TipoActividad } from "../../../../types/voluntarios";

export default function ParticipacionForm({ onSuccess }: { onSuccess?: () => void }) {
  const crear = useCrearParticipacion();
  const [formData, setFormData] = useState({
    actividad: TipoActividad.ENTRENAMIENTO,
    fecha: "",
    horaInicio: "",
    horaFin: "",
    descripcion: "",
    ubicacion: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.actividad) newErrors.actividad = "Actividad requerida";
    if (!formData.fecha) newErrors.fecha = "Fecha requerida";
    if (!formData.horaInicio) newErrors.horaInicio = "Hora inicio requerida";
    if (!formData.horaFin) newErrors.horaFin = "Hora fin requerida";
    if (!formData.descripcion || formData.descripcion.length < 5) newErrors.descripcion = "Mínimo 5 caracteres";
    if (formData.descripcion.length > 200) newErrors.descripcion = "Máximo 200 caracteres";
    if (!formData.ubicacion || formData.ubicacion.length < 5) newErrors.ubicacion = "Mínimo 5 caracteres";
     if (formData.ubicacion.length > 100) newErrors.ubicacion = "Máximo 100 caracteres";
    // Validar que horaFin > horaInicio
    if (formData.horaInicio && formData.horaFin) {
      const [hInicio, mInicio] = formData.horaInicio.split(':').map(Number);
      const [hFin, mFin] = formData.horaFin.split(':').map(Number);
      if ((hFin * 60 + mFin) <= (hInicio * 60 + mInicio)) {
        newErrors.horaFin = "La hora de fin debe ser mayor";
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

  
    try {
      await crear.mutateAsync(formData);
      onSuccess?.();
      setFormData({
        actividad: TipoActividad.ENTRENAMIENTO,
        fecha: "",
        horaInicio: "",
        horaFin: "",
        descripcion: "",
        ubicacion: "",
      });
      setErrors({});
    } catch (error: any) {
      console.error(' ERROR:', error);
      setSubmitError(error?.response?.data?.message || 'Error al registrar');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-5">
      <h2 className="text-2xl font-bold text-black text-center"> Registrar Participación</h2>

      {/* Actividad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Actividad *</label>
        <select 
          value={formData.actividad} 
          onChange={(e) => handleChange('actividad', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          {Object.values(TipoActividad).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.actividad && <p className="text-red-500 text-xs mt-1">{errors.actividad}</p>}
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
        <input 
          type="date" 
          value={formData.fecha} 
          onChange={(e) => handleChange('fecha', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
      </div>

      {/* Hora inicio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio *</label>
        <input 
          type="time" 
          value={formData.horaInicio} 
          onChange={(e) => handleChange('horaInicio', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        {errors.horaInicio && <p className="text-red-500 text-xs mt-1">{errors.horaInicio}</p>}
      </div>

      {/* Hora fin */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hora de fin *</label>
        <input 
          type="time" 
          value={formData.horaFin} 
          onChange={(e) => handleChange('horaFin', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        {errors.horaFin && <p className="text-red-500 text-xs mt-1">{errors.horaFin}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <textarea 
          value={formData.descripcion} 
          onChange={(e) => handleChange('descripcion', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows={3}
          placeholder="Describe la actividad..."
          maxLength={200} 
        />
        {/* Indicador de contador */}
        <div className="flex justify-between text-xs mt-1">
          <span
            className={`${
              formData.descripcion.length >= 200 ? 'text-red-600 font-semibold' : 'text-gray-500'
            }`}
          >
            {formData.descripcion.length}/200
          </span>
          {formData.descripcion.length >= 200 && (
            <span className="text-red-600 font-semibold">
              Máximo 200 caracteres permitidos
            </span>
          )}
        </div>
        {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
      </div>

      {/* Ubicación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
        <textarea 
          value={formData.ubicacion} 
          onChange={(e) => handleChange('ubicacion', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows={2}
          placeholder="Lugar donde se realizó la actividad..."
          maxLength={100}
        />
        {/* Indicador de contador */}
       <div className="flex justify-between text-xs mt-1">
          <span
            className={`${
              formData.ubicacion.length >= 100 ? 'text-red-600 font-semibold' : 'text-gray-500'
            }`}
          >
            {formData.ubicacion.length}/100
          </span>
          {formData.ubicacion.length >= 100 && (
            <span className="text-red-600 font-semibold">
              Máximo 100 caracteres permitidos
            </span>
          )}
        </div>
        {errors.ubicacion && <p className="text-red-500 text-xs mt-1">{errors.ubicacion}</p>}
      </div>

      {/* Error general */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={crear.isPending}
        className="w-full bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {crear.isPending ? "Registrando..." : "Registrar"}
      </button>
    </form>
  );
}