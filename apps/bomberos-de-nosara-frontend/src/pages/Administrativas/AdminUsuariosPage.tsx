import { useEffect, useState } from 'react';
import { getUsers, createUser, deleteUser } from '../../service/userService';
import EditUserModal from "../../components/ui/Administrativa/UsuariosAdmin/EditUserModal";
import ConfirmDeleteModal from "../../components/ui/Administrativa/UsuariosAdmin/ConfirmDeleteModal";


export default function AdminUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);



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
          <li
            key={user.id}
            className="border p-3 rounded bg-gray-50 flex justify-between items-center"
          >
            <div>
              <strong>{user.username}</strong> — Roles: {user.roles.map((r: any) => r.name).join(', ')}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setEditingUser(user)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => setDeletingUser(user)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>


      {editingUser && (
        <EditUserModal
          user={{
            id: editingUser.id,
            nombre: editingUser.username, // si tienes nombre separado, cámbialo
            email: editingUser.username,  // si tienes email, cámbialo
            rol: editingUser.roles[0]?.name || '',
          }}
          onClose={() => setEditingUser(null)}
          onUpdated={loadUsers}
        />
      )}

      {deletingUser && (
        <ConfirmDeleteModal
          userName={deletingUser.username}
          onCancel={() => setDeletingUser(null)}
          onConfirm={async () => {
            try {
              await deleteUser(deletingUser.id);
              await loadUsers();
              setDeletingUser(null);
            } catch (err) {
              alert('Error al eliminar usuario');
            }
          }}
        />
      )}

    </div>
  );
}
