const UsuariosTable = () => {
    const users = [
      { id: 1, nombre: 'Carlos Pérez', rol: 'Admin' },
      { id: 2, nombre: 'Laura Jiménez', rol: 'Bombero' },
    ];
  
    return (
      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default UsuariosTable;
  