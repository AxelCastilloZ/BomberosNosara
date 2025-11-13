import { useState } from "react";
import ParticipacionForm from "../../modules/voluntarios/components/toVoluntarios/ParticipacionForm";
import { useHorasAprobadas, useHorasPendientes } from "../../modules/voluntarios/Hooks/useVoluntarios";
import VoluntariosParticipaciones from "../../modules/voluntarios/components/toVoluntarios/VoluntariosParticipaciones";
import { CheckCircle, Clock, X, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from "../../components/ui/alert";

export default function VoluntariosPage() {
	const { data: horasAprobadas = 0, isLoading: isLoadingHorasA } = useHorasAprobadas();
	const { data: horasPendientes = 0, isLoading: isLoadingHorasP } = useHorasPendientes();
	const [showForm, setShowForm] = useState(false);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [showErrorAlert, setShowErrorAlert] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const fmtHoras = (dec: number) => {
		const h = Math.floor(dec);
		const m = Math.round((dec - h) * 60);
		return `${h} h ${m} min`;
	};

	const handleSuccess = () => {
		// Mostrar alerta
		setShowSuccessAlert(true);
		setShowErrorAlert(false);

		// Cerrar modal después de 0.5ms
		setTimeout(() => {
			setShowForm(false);
		}, 50);

		// Ocultar alerta después de 2s
		setTimeout(() => {
			setShowSuccessAlert(false);
		}, 2000);
	};

	const handleError = (message: string) => {
		// Mostrar alerta de error
		setErrorMessage(message);
		setShowErrorAlert(true);
		setShowSuccessAlert(false);

		// Ocultar alerta después de 30s
		setTimeout(() => {
			setShowErrorAlert(false);
		}, 2000);
	};

	return (
		<div className="p-2 space-y-4 pt-18">
			{/* Alertas flotantes */}
			{showSuccessAlert && (
				<div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
					<Alert variant="success">
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

			{showErrorAlert && (
				<div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
					<Alert variant="destructive">
						<AlertDescription>
							<svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div>
								<strong className="font-semibold">Error al registrar</strong>
								<p className="mt-1">{errorMessage}</p>
							</div>
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Botón volver */}
			<button
				onClick={() => window.history.back()}
				className="flex items-center gap-2 text-red-700 hover:underline mb-4"
			>
				<ArrowLeft className="h-5 w-5" />
				Volver
			</button>

			{/* Encabezado */}
			<div className="text-red-800 p-2 flex items-center justify-between">
				<div className="p-6">
					<h2 className="text-3xl font-bold mb-2">
						Bienvenido a la sección de registro de horas de voluntarios
					</h2>
					<p className="text-white mt-2">
						Registra aquí tus actividades y lleva el control de tus horas.
					</p>
				</div>
			</div>

			{/* Métricas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
					<CheckCircle className="h-8 w-8 text-green-500" />
					<div>
						<p className="text-sm text-gray-600">Total horas aprobadas</p>
						<p className="text-2xl font-bold">
							{isLoadingHorasA ? "..." : fmtHoras(horasAprobadas)}
						</p>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
					<Clock className="h-8 w-8 text-orange-500" />
					<div>
						<p className="text-sm text-gray-600">Total horas pendientes</p>
						<p className="text-2xl font-bold">
							{isLoadingHorasP ? "..." : fmtHoras(horasPendientes)}
						</p>
					</div>
				</div>
			</div>

			{/* Botón para abrir formulario */}
			<div className="text-center text-white font-semibold">
				<button
					onClick={() => setShowForm(true)}
					className="float-right mr-11 bg-red-800 hover:bg-red-700 px-6 py-2 rounded-lg shadow-2xl transition-colors duration-200 mb-4"
				>
					Registrar participación
				</button>
			</div>

			{/* Lista de participaciones */}
			<section>
				<h2 className="text-2xl font-bold text-black pt-6 mb-3">
					Mis Participaciones
				</h2>
				<VoluntariosParticipaciones />
			</section>

			{/* Modal centrado */}
			{showForm && (
				<>
					{/* Overlay */}
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
						onClick={() => setShowForm(false)}
					/>
					
					{/* Modal */}
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div 
							className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-[scaleIn_0.2s_ease-out]"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="bg-red-800 px-6 py-4 flex items-center justify-between">
								<h2 className="text-xl font-bold text-white">Nueva Participación</h2>
								<button
									onClick={() => setShowForm(false)}
									className="text-white hover:bg-red-700 p-2 rounded-lg transition-colors"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							{/* Contenido con scroll */}
							<div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
								<ParticipacionForm onSuccess={handleSuccess} onError={handleError} />
							</div>
						</div>
					</div>
				</>
			)}

			<style>{`
				@keyframes scaleIn {
					from {
						opacity: 0;
						transform: scale(0.95);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
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
		</div>
	);
}