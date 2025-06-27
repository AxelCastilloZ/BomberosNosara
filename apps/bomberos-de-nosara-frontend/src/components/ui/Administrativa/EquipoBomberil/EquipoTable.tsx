const EquipoTable = () => {
    const data = [
      { id: 1, nombre: 'Casco', estado: 'Bueno' },
      { id: 2, nombre: 'Botas', estado: 'Dañado' },
    ];
  
    return (
      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id} className="text-center">
              <td>{item.nombre}</td>
              <td>{item.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default EquipoTable;
  