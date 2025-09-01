import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { getUsers, createUser, deleteUser } from '../../service/user';
import EditUserModal from '../../components/ui/Administrativa/UsuariosAdmin/EditUserModal';
import ConfirmDeleteModal from '../../components/ui/Administrativa/UsuariosAdmin/ConfirmDeleteModal';
import { FaUserPlus, FaUsers } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';

import { ROLES, ROLE_LABELS, RoleName } from '../../constants/roles';

// ---------- Tipos ----------
type Role = { id: number; name: RoleName };
type UserItem = { id: number; username: string; email: string; roles: Role[] };

type FormValues = {
  username: string;
  email: string;
  password: string;
  roles: RoleName[];
};

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    username: yup.string().required('El nombre de usuario es obligatorio'),
    email: yup
      .string()
      .email('Correo inválido')
      .required('El correo es obligatorio'),
    password: yup
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .required('La contraseña es obligatoria'),
    roles: yup
      .array(
        // cada item debe ser uno de los roles válidos y no undefined
        yup.mixed<RoleName>().oneOf(ROLES as readonly RoleName[]).required()
      )
      .min(1, 'Debes seleccionar al menos un rol')
      .required(),
  })
  .required();

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema), 
    defaultValues: {
      username: '',
      email: '',
      password: '',
      roles: [] as RoleName[],
    },
  });

  
  const selectedRoles = watch('roles') ?? [];

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      setError('');
      await createUser({
        username: data.username,
        email: data.email,
        password: data.password,
        roles: data.roles,
      });
      reset();
      await loadUsers();
    } catch (err: any) {
      const msg =
        err?.response?.data?.code === 'DUPLICATE_KEY'
          ? 'Ya existe un usuario con ese nombre o correo.'
          : 'No se pudo crear el usuario';
      setError(msg);
    } finally {
      setSubmitting(false);
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
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full border border-gray-300 p-3 rounded"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border border-gray-300 p-3 rounded"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <div>
            <p className="font-medium mb-2">Roles:</p>
            <div className="lg:grid grid-cols-2 md:flex gap-2">
              {ROLES.map((role) => (
                <label key={role} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => {
                      const current = selectedRoles; // RoleName[]
                      setValue(
                        'roles',
                        current.includes(role)
                          ? (current.filter((r) => r !== role) as RoleName[])
                          : ([...current, role] as RoleName[])
                      );
                    }}
                  />
                  <span>{ROLE_LABELS[role]}</span>
                </label>
              ))}
            </div>
            {errors.roles && (
              <p className="text-red-500 text-sm">
                {errors.roles.message as string}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-2xl transition"
          >
            {submitting ? 'Creando…' : 'Crear Usuario'}
          </button>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiOutlineUserGroup className="text-gray-900" />
          Usuarios existentes
        </h2>

        {loading ? (
          <p className="text-gray-600">Cargando usuarios…</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="bg-orange-50 border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-gray-800">{user.username}</span>
                  <span className="ml-2 text-gray-600 text-sm">({user.email})</span>
                  <span className="ml-2 text-gray-600 text-sm">
                    | Roles: {user.roles.map((r) => ROLE_LABELS[r.name]).join(', ')}
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
        )}
      </div>

      {/* Modales */}
      {editingUser && (
        <EditUserModal
          user={{
            id: editingUser.id,
            nombre: editingUser.username,
            email: editingUser.email,
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
            } catch {
              alert('Error al eliminar usuario');
            }
          }}
        />
      )}
    </div>
  );
}
