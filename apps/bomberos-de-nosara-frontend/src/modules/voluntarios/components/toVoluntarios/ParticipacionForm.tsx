import { useState } from "react";
import { useCrearParticipacion } from "../../../../modules/voluntarios/Hooks/useVoluntarios";
import { TipoActividad } from "../../types/voluntarios";
import { Alert, AlertDescription } from "../../../../components/ui/alert";

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
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setSubmitError(null);
    setShowSuccess(false);
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
      
      setShowSuccess(true);
      setSubmitError(null);
      
      setFormData({
        actividad: TipoActividad.ENTRENAMIENTO,
        fecha: "",
        horaInicio: "",
        horaFin: "",
        descripcion: "",
        ubicacion: "",
      });
      setErrors({});
      
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 20000);
      
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || 'Error al registrar');
      setShowSuccess(false);
    }
  };

  return (
    <>
      {/* Alerta flotante superior derecha */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
          <Alert 
            variant="success"
            actions={[
              {
                label: "Cerrar",
                onClick: () => setShowSuccess(false),
                variant: "default"
              }
            ]}
          >
            <AlertDescription>
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong className="font-semibold">¡Participación registrada!</strong>
                <p className="mt-1">La participación se ha registrado exitosamente.</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {submitError && (
        <div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
          <Alert 
            variant="destructive"
            actions={[
              {
                label: "Cerrar",
                onClick: () => setSubmitError(null),
                variant: "default"
              }
            ]}
          >
            <AlertDescription>
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong className="font-semibold">Error al registrar</strong>
                <p className="mt-1">{submitError}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actividad *</label>
          <select 
            value={formData.actividad} 
            onChange={(e) => handleChange('actividad', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
          >
            {Object.values(TipoActividad).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.actividad && <p className="text-red-500 text-xs mt-1">{errors.actividad}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input 
            type="date" 
            value={formData.fecha} 
            onChange={(e) => handleChange('fecha', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
          />
          {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio *</label>
            <input 
              type="time" 
              value={formData.horaInicio} 
              onChange={(e) => handleChange('horaInicio', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            />
            {errors.horaInicio && <p className="text-red-500 text-xs mt-1">{errors.horaInicio}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de fin *</label>
            <input 
              type="time" 
              value={formData.horaFin} 
              onChange={(e) => handleChange('horaFin', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            />
            {errors.horaFin && <p className="text-red-500 text-xs mt-1">{errors.horaFin}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea 
            value={formData.descripcion} 
            onChange={(e) => handleChange('descripcion', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            rows={3}
            placeholder="Describe la actividad..."
            maxLength={200} 
          />
          <div className="flex justify-between text-xs mt-1">
            <span className={formData.descripcion.length >= 200 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
              {formData.descripcion.length}/200
            </span>
          </div>
          {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
          <textarea 
            value={formData.ubicacion} 
            onChange={(e) => handleChange('ubicacion', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
            rows={2}
            placeholder="Lugar donde se realizó la actividad..."
            maxLength={100}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className={formData.ubicacion.length >= 100 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
              {formData.ubicacion.length}/100
            </span>
          </div>
          {errors.ubicacion && <p className="text-red-500 text-xs mt-1">{errors.ubicacion}</p>}
        </div>

        <button
          type="submit"
          disabled={crear.isPending}
          className="w-full bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {crear.isPending ? "Registrando..." : "Registrar"}
        </button>
      </form>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}