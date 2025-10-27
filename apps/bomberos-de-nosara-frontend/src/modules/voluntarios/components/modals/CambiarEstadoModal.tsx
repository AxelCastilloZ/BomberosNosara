// CambiarEstadoModal.tsx - VERSIÓN CORREGIDA
import { useEffect, useState } from "react";
import { useActualizarEstado } from "../../Hooks/useVoluntarios";

type Props = {
	id: number;
	motivoActual?: string | null; 
	onClose: () => void;
};

export default function CambiarEstadoModal({ id, motivoActual, onClose, }: Props) {
	const actualizar = useActualizarEstado();
	const [estado, setEstado] = useState<'aprobada' | 'rechazada'>(
  motivoActual ? 'rechazada' : 'aprobada'
  );
	const [motivoRechazo, setMotivoRechazo] = useState(motivoActual || '');

useEffect(() => {
		if (motivoActual) setMotivoRechazo(motivoActual);
	}, [motivoActual]);

	useEffect(() => {
		if (estado === 'aprobada') {
			setMotivoRechazo('');
		}
	}, [estado]);


	const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();

	if (estado === 'rechazada') {
		if (motivoRechazo.trim().length < 5 || motivoRechazo.trim().length > 200) {
			alert('El motivo debe tener entre 5 y 200 caracteres.');
			return;
		}
	}

	try {
		const dto: any = { estado };
		if (estado === 'rechazada') {
			dto.motivoRechazo = motivoRechazo;
		}
		
		await actualizar.mutateAsync({ id, dto });
		onClose();
	} catch (error) {
		console.error('Error al actualizar:', error);
	}
};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
				<h2 className="text-lg font-bold text-gray-800">Cambiar estado</h2>
				
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">Estado</label>
						<select 
							value={estado} 
							onChange={(e) => setEstado(e.target.value as 'aprobada' | 'rechazada')}
							className="w-full border border-gray-300 rounded px-3 py-2"
						>
							<option value="aprobada">Aprobar</option>
							<option value="rechazada">Rechazar</option>
						</select>
					</div>

									{estado === 'rechazada' && (
					<div>
						<label className="block text-sm font-medium text-gray-700">Motivo</label>
						<textarea
							value={motivoRechazo}
							onChange={(e) => {
								const input = e.target.value;
								if (input.length <= 200) {
									setMotivoRechazo(input);
								}
							}}
							className="w-full border border-gray-300 rounded px-3 py-2"
							rows={3}
							placeholder="Escriba el motivo del rechazo..."
							required
						/>
						<div className="flex justify-between text-xs mt-1">
							<span
								className={`${
									motivoRechazo.length > 200 ? 'text-red-600' : 'text-gray-500'
								}`}
							>
								{motivoRechazo.length}/200
							</span>
							{motivoRechazo.length >= 200 && (
								<span className="text-red-600 font-medium">
									Máximo 200 caracteres permitidos
								</span>
							)}
						</div>
					</div>
				)}

					<div className="flex justify-end gap-2">
						<button 
							type="button" 
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
						>
							Cancelar
						</button>
						<button 
							type="submit"
							disabled={actualizar.isPending}
							className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
						>
							{actualizar.isPending ? "Guardando..." : "Guardar"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}