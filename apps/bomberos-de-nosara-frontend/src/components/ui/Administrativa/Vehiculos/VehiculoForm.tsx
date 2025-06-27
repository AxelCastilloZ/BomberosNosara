const VehiculoForm = () => {
    return (
      <form className="space-y-4 mt-4">
        <input placeholder="Placa" className="w-full p-2 border rounded" />
        <input placeholder="Tipo de vehículo" className="w-full p-2 border rounded" />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
          Guardar
        </button>
      </form>
    );
  };
  
  export default VehiculoForm;
  