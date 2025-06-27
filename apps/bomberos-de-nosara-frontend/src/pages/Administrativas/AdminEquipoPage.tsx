import EquipoForm from '../../components/ui/Administrativa/EquipoBomberil/EquipoForm';
import EquipoTable from '../../components/ui/Administrativa/EquipoBomberil/EquipoTable';


const AdminEquipoPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Inventario de Equipo Bomberil</h1>
      <EquipoForm />
      <EquipoTable />
    </div>
  );    
};

export default AdminEquipoPage;
