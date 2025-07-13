import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getUsers, createUser, deleteUser } from '../../service/userService';
import EditUserModal from '../../components/ui/Administrativa/UsuariosAdmin/EditUserModal';
import ConfirmDeleteModal from '../../components/ui/Administrativa/UsuariosAdmin/ConfirmDeleteModal';
import { FaUserPlus, FaUsers } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';

// Esquema de validación
const schema = yup.object({
  username: yup.string().required('El nombre de usuario es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roles: yup.array().min(1, 'Debes seleccionar al menos un rol'),
});

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      roles: [],
    },
  });

  const selectedRoles = watch('roles');
  const allRoles = ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'];

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await createUser(data);
      reset();
      loadUsers();
    } catch (err) {
      setError('No se pudo crear el usuario');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-8 pt-24 max-w-4xl mx-auto">
      <h1 className="lg:text-4xl md:text-3xl sm:text-3xl font-extrabold text-red-700 mb-6 flex items-center gap-2">
        <FaUsers className="text-red-700" />
        Panel de Gestión de Usuarios
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Formulario de creación */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-10 border border-gray-200">
        <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
          <FaUserPlus className="text-black lg:text-3xl sm:text-3xl" />
          Crear nuevo usuario
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            placeholder="Nombre de usuario"
            className="w-full border border-gray-300 p-3 rounded"
            {...register('username')}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border border-gray-300 p-3 rounded"
            {...register('password')}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <div>
            <p className="font-medium mb-2">Roles:</p>
            <div className="lg:grid grid-cols-2 md:flex gap-2">
              {allRoles.map((role) => (
                <label key={role} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoles?.includes(role)}
                    onChange={() => {
                      const current = selectedRoles || [];
                      if (current.includes(role)) {
                        setValue('roles', current.filter((r) => r !== role));
                      } else {
                        setValue('roles', [...current, role]);
                      }
                    }}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
            {errors.roles && <p className="text-red-500 text-sm">{errors.roles.message}</p>}
          </div>

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-2xl transition"
          >
            Crear Usuario
          </button>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiOutlineUserGroup className="text-gray-900" />
          Usuarios existentes
        </h2>
        <ul className="space-y-3">
          {users.map((user: any) => (
            <li
              key={user.id}
              className="bg-orange-50 border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center"
            >
              <div>
                <span className="font-bold text-gray-800">{user.username}</span>
                <span className="ml-2 text-gray-600 text-sm">
                  | Roles: {user.roles.map((r: any) => r.name).join(', ')}
                </span>
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
      </div>

      {/* Modales */}
      {editingUser && (
        <EditUserModal
          user={{
            id: editingUser.id,
            nombre: editingUser.username,
            email: editingUser.username, // Cambia esto si tienes un campo real de email
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
