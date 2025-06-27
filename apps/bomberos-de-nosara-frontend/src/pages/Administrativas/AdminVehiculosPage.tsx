import VehiculoForm from '../../components/ui/Administrativa/Vehiculos/VehiculoForm';
import VehiculoTable from '../../components/ui/Administrativa/Vehiculos/VehiculoTable';


const AdminVehiculosPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Inventario de Vehículos</h1>
      <VehiculoForm />
      <VehiculoTable />
    </div>
  );
};

export default AdminVehiculosPage;
