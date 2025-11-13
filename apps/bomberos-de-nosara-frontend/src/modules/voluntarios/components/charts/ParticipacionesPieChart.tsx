import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Registrar componentes de Chart.js necesarios para el gráfico de pastel
ChartJS.register(ArcElement, Tooltip, Legend);

interface ParticipacionesPieChartProps {
  participacionesPorTipo: {
    Entrenamiento: number;
    Emergencia: number;
    Simulacros: number;
  };
}

export default function ParticipacionesPieChart({
  participacionesPorTipo,
}: ParticipacionesPieChartProps) {
  // Preparar datos para el gráfico
  const data = {
    labels: ['Entrenamiento', 'Emergencia', 'Simulacros'],
    datasets: [
      {
        label: 'Participaciones',
        data: [
          participacionesPorTipo.Entrenamiento,
          participacionesPorTipo.Emergencia,
          participacionesPorTipo.Simulacros,
        ],
        backgroundColor: [
          'rgba(5, 66, 163, 0.8)',  // Azul para Entrenamiento
          'rgba(164, 15, 10, 0.87)',   // Rojo para Emergencia
          'rgb(144, 142, 142)',  // gris para Simulacros
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgb(138, 138, 138)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc: number, curr) => acc + (curr as number), 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold text-gray-800 mb-4 text-center">Participaciones por Tipo</h3>
      <div className="flex justify-center items-center" style={{ maxHeight: '300px' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
