import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Registrar componentes de Chart.js necesarios para el gráfico de barras
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopVoluntariosBarChartProps {
  topVoluntarios: { nombre: string; horas: number }[];
  titulo?: string;
}

export default function TopVoluntariosBarChart({
  topVoluntarios,
  titulo = 'Top 5 Voluntarios',
}: TopVoluntariosBarChartProps) {
  // Función para formatear horas decimales a "Xh Ymin"
  const fmtHoras = (dec: number) => {
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  };

  // Calcular el máximo de horas para ajustar la escala
  const maxHoras = Math.max(...topVoluntarios.map((v) => v.horas));

  // Determinar el stepSize basado en el rango de horas
  const getStepSize = (max: number): number => {
    if (max <= 10) return 2;
    if (max <= 50) return 10;
    if (max <= 100) return 20;
    if (max <= 200) return 40;
    if (max <= 500) return 100;
    return 150; // Para valores muy altos
  };

  // Preparar datos para el gráfico
  const data = {
    labels: topVoluntarios.map((v) => v.nombre),
    datasets: [
      {
        label: 'Horas trabajadas',
        data: topVoluntarios.map((v) => v.horas),
        backgroundColor: [
          '#feeba0',   // Oro para el 1ro
          '#b3aca8', // Plata para el 2do
          '#dfa486cc',  // Bronce para el 3ro
          '#9af66fcc',  // verde para el 4to
          '#fcb0b0',  // Rojo para el 5to
        ],
        borderColor: [
          '#fadf8e',
          '#a8a29fff',
          '#de9d7d',
          '#88f679d9',
          '#fba2a2',
        ],
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y', // Gráfico horizontal
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.x || 0;
            return `Horas: ${fmtHoras(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: maxHoras * 1.1, // Agregar 10% de espacio extra
        title: {
          display: true,
          text: 'Horas',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        ticks: {
          stepSize: getStepSize(maxHoras),
          callback: function (value) {
            return Math.floor(value as number) + 'h';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        ticks: {
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold text-gray-800 mb-4">{titulo}</h3>
      <div style={{ height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
