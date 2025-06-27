import { useEffect, useState } from 'react';
import { getUsers, createUser } from '../../service/userService';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ username, password, roles });
      setUsername('');
      setPassword('');
      setRoles([]);
      loadUsers();
    } catch (err) {
      setError('No se pudo crear el usuario');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const allRoles = ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleCreateUser} className="bg-white p-4 shadow rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Crear Usuario</h2>
        <input
          placeholder="Nombre de usuario"
          className="w-full mb-2 border p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          placeholder="Contraseña"
          className="w-full mb-2 border p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="mb-2">
          <span className="font-medium">Roles:</span>
          {allRoles.map((role) => (
            <label key={role} className="block">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() =>
                  setRoles((prev) =>
                    prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
                  )
                }
              />
              {role}
            </label>
          ))}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Crear
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Usuarios existentes</h2>
      <ul className="space-y-2">
        {users.map((user: any) => (
          <li key={user.id} className="border p-3 rounded bg-gray-50">
            <strong>{user.username}</strong> — Roles: {user.roles.map((r: any) => r.name).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
