const VehiculoTable = () => {
    const data = [
      { id: 1, placa: 'B12345', tipo: 'Camión cisterna' },
      { id: 2, placa: 'B54321', tipo: 'Ambulancia' },
    ];
  
    return (
      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.placa}</td>
              <td>{item.tipo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default VehiculoTable;
  