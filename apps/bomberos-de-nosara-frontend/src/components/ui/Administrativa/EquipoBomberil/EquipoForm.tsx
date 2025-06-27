const EquipoForm = () => {
    return (
      <form className="space-y-4 mt-4">
        <input placeholder="Nombre del equipo" className="w-full p-2 border rounded" />
        <select className="w-full p-2 border rounded">
          <option value="">Estado</option>
          <option value="bueno">Bueno</option>
          <option value="regular">Regular</option>
          <option value="dañado">Dañado</option>
        </select>
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
          Guardar
        </button>
      </form>
    );
  };
  
  export default EquipoForm;
  