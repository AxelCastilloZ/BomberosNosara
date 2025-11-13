// CambiarEstadoModal.tsx
import { useEffect, useState } from "react";
import { useActualizarEstado } from "../../Hooks/useVoluntarios";

type Props = {
	id: number;
	motivoActual?: string | null;
	onClose: () => void;
	onSuccess: (tipoEstado: 'aprobada' | 'rechazada') => void;
	onError: (message: string) => void;
};

export default function CambiarEstadoModal({ id, motivoActual, onClose, onSuccess, onError }: Props) {
	const actualizar = useActualizarEstado();
	const [estado, setEstado] = useState<'aprobada' | 'rechazada'>(
		motivoActual ? 'rechazada' : 'aprobada'
	);
	const [motivoRechazo, setMotivoRechazo] = useState(motivoActual || '');
	const [localError, setLocalError] = useState<string | null>(null);

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
			const motivoTrimmed = motivoRechazo.trim();
			if (motivoTrimmed.length === 0) {
				setLocalError('Debe escribir una nota de rechazo.');
				setTimeout(() => setLocalError(null), 5000);
				return;
			}
			if (motivoTrimmed.length < 5 || motivoTrimmed.length > 200) {
				setLocalError('El motivo debe tener entre 5 y 200 caracteres.');
				setTimeout(() => setLocalError(null), 5000);
				return;
			}
		}

		try {
			const dto: any = { estado };
			if (estado === 'rechazada') {
				dto.motivoRechazo = motivoRechazo;
			}

			await actualizar.mutateAsync({ id, dto });

			// Llamar al handler de éxito del padre
			onSuccess(estado);

			// Cerrar modal después de un pequeño delay (50ms)
			setTimeout(() => {
				onClose();
			}, 50);

		} catch (error: any) {
			console.error('Error al actualizar:', error);
			onError(error?.response?.data?.message || 'Error al actualizar el estado');
		}
	};

	return (
		<>
			{/* Modal */}
			<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
				<div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
					<h2 className="text-lg font-bold text-gray-800">Cambiar estado</h2>

					{actualizar.isPending ? (
						<div className="flex flex-col items-center justify-center py-12 space-y-4">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
							<p className="text-gray-600 font-medium">Guardando cambios...</p>
						</div>
					) : (
						<>
							{localError && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
									{localError}
								</div>
							)}

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
											// Limpiar error cuando el usuario empieza a escribir
											if (localError) setLocalError(null);
										}
									}}
									className="w-full border border-gray-300 rounded px-3 py-2"
									rows={3}
									placeholder="Escriba el motivo del rechazo..."
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
								className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Guardar
							</button>
						</div>
					</form>
						</>
					)}
				</div>
			</div>
		</>
	);
}