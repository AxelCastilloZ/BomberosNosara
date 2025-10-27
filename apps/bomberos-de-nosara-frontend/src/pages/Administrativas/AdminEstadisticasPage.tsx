import ChartMensual from '../../components/ui/Administrativa/Estadisticas/ChartMensual';
import ChartTiempoRespuesta from '../../components/ui/Administrativa/Estadisticas/ChartTiempoRespuesta';
import EstadisticasOverview from '../../components/ui/Administrativa/Estadisticas/EstadisticasOverview';

const AdminEstadisticasPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Estadísticas Generales</h1>
      <EstadisticasOverview />
      <ChartMensual />
      <ChartTiempoRespuesta />
    </div>
  );
};

export default AdminEstadisticasPage;
