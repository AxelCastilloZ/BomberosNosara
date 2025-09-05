import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useUsers } from '../../../../hooks/users/useUsers';
import { ROLES, ROLE_LABELS } from '../../../../constants/roles';
import type { RoleName, User } from '../../../../types/user';

type Props = { user: User; onClose: () => void };

type FormValues = {
  username: string;
  email: string;
  password?: string;
  roles: RoleName[];
};

const ROLES_LIST = ROLES as readonly RoleName[];
const roleSchema: yup.MixedSchema<RoleName> =
  yup.mixed<RoleName>().oneOf(ROLES_LIST, 'Rol inválido').required();

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    username: yup.string().required('El nombre es obligatorio'),
    email: yup.string().email('Correo inválido').required('El correo es obligatorio'),
    password: yup.string().optional(),
    roles: yup.array().of(roleSchema).min(1, 'Selecciona al menos un rol').required(),
  })
  .required();

const EditUser: React.FC<Props> = ({ user, onClose }) => {
  const { edit, validateUnique } = useUsers();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: user.username,
      email: user.email,
      roles: user.roles?.map((r) => r.name) ?? [],
    },
  });

  const selected = watch('roles') ?? [];

  const onSubmit = async (v: FormValues) => {
    try {
      await edit.mutateAsync({
        id: user.id,
        data: {
          username: v.username,
          email: v.email,
          roles: v.roles,
          password: v.password || undefined,
        },
      });
      onClose();
    } catch (err: any) {
      if (err?.code === 'DUPLICATE_KEY' && (err.field === 'email' || err.field === 'username')) {
        setError(err.field as 'email' | 'username', {
          type: 'server',
          message: err.message || 'Ya existe.',
        });
      } else {
        setError('root', { type: 'server', message: err?.message || 'No se pudo actualizar.' });
      }
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Editar usuario</h3>
        <button onClick={onClose} className="text-sm text-gray-600 hover:underline">Cerrar</button>
      </div>

      {errors.root?.message && (
        <div className="mb-2 rounded bg-red-50 border border-red-200 p-2 text-red-700">{errors.root.message}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input
          className={`w-full p-3 border rounded ${
            errors.username ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300'
          }`}
          placeholder="Nombre de usuario"
          {...register('username', {
            onBlur: async (e) => {
              const res = await validateUnique('username', e.target.value, { currentValue: user.username });
              if (res === false) setError('username', { type: 'server', message: 'Ese usuario ya existe' });
              else clearErrors('username');
            },
          })}
        />
        {errors.username && <p className="text-red-500 text-sm -mt-1">{errors.username.message}</p>}

        <input
          type="email"
          className={`w-full p-3 border rounded ${
            errors.email ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300'
          }`}
          placeholder="Correo electrónico"
          {...register('email', {
            onBlur: async (e) => {
              const res = await validateUnique('email', e.target.value, { currentValue: user.email });
              if (res === false) setError('email', { type: 'server', message: 'Ese correo ya existe' });
              else clearErrors('email');
            },
          })}
        />
        {errors.email && <p className="text-red-500 text-sm -mt-1">{errors.email.message}</p>}

        <input
          type="password"
          className="w-full p-3 border rounded border-gray-300"
          placeholder="Nueva contraseña (opcional)"
          {...register('password')}
        />

        <div>
          <p className="font-medium mb-2">Roles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ROLES_LIST.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(r)}
                  onChange={() => {
                    const next = selected.includes(r) ? selected.filter((x) => x !== r) : [...selected, r];
                    setValue('roles', next as RoleName[], { shouldValidate: true });
                  }}
                />
                <span>{ROLE_LABELS[r]}</span>
              </label>
            ))}
          </div>
          {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles.message as string}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || edit.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {isSubmitting || edit.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
