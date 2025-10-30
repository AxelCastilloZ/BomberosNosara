// CambiarEstadoModal.tsx
import { useEffect, useState } from "react";
import { useActualizarEstado } from "../../Hooks/useVoluntarios";
import { Alert, AlertDescription } from "../../../../components/ui/alert";

type Props = {
	id: number;
	motivoActual?: string | null; 
	onClose: () => void;
};

export default function CambiarEstadoModal({ id, motivoActual, onClose }: Props) {
	const actualizar = useActualizarEstado();
	const [estado, setEstado] = useState<'aprobada' | 'rechazada'>(
		motivoActual ? 'rechazada' : 'aprobada'
	);
	const [motivoRechazo, setMotivoRechazo] = useState(motivoActual || '');
	const [showSuccess, setShowSuccess] = useState(false);
	const [showError, setShowError] = useState<string | null>(null);

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
				setShowError('El motivo debe tener entre 5 y 200 caracteres.');
				setTimeout(() => setShowError(null), 5000);
				return;
			}
		}

		try {
			const dto: any = { estado };
			if (estado === 'rechazada') {
				dto.motivoRechazo = motivoRechazo;
			}
			
			await actualizar.mutateAsync({ id, dto });
			
			// Mostrar alerta de éxito
			setShowSuccess(true);
			
			// Cerrar modal después de un pequeño delay
			setTimeout(() => {
				setShowSuccess(false);
				onClose();
			}, 1500);
			
		} catch (error: any) {
			console.error('Error al actualizar:', error);
			setShowError(error?.response?.data?.message || 'Error al actualizar el estado');
			setTimeout(() => setShowError(null), 5000);
		}
	};

	return (
		<>
			{/* Alerta de éxito/warning según acción */}
			{showSuccess && (
				<div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
					<Alert 
						variant={estado === 'aprobada' ? 'success' : 'warning'}
						actions={[
							{
								label: "Cerrar",
								onClick: () => setShowSuccess(false),
								variant: "default"
							}
						]}
					>
						<AlertDescription>
							{estado === 'aprobada' ? (
								<>
									<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div>
										<strong className="font-semibold">¡Participación aprobada!</strong>
										<p className="mt-1">El estado se ha actualizado correctamente.</p>
									</div>
								</>
							) : (
								<>
									<svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									<div>
										<strong className="font-semibold">Participación rechazada</strong>
										<p className="mt-1">El estado se ha actualizado correctamente.</p>
									</div>
								</>
							)}
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Alerta de error */}
			{showError && (
				<div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
					<Alert 
						variant="destructive"
						actions={[
							{
								label: "Cerrar",
								onClick: () => setShowError(null),
								variant: "default"
							}
						]}
					>
						<AlertDescription>
							<svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div>
								<strong className="font-semibold">Error al actualizar</strong>
								<p className="mt-1">{showError}</p>
							</div>
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Modal */}
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