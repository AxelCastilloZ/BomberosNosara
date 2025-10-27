import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useUsers } from '../../../../hooks/users/useUsers';
import { ROLES, ROLE_LABELS } from '../../../../constants/roles';
import type { RoleName } from '../../../../types/user';

type FormValues = {
  username: string;
  email: string;
  password: string;
  roles: RoleName[];
};

const ROLES_LIST = ROLES as readonly RoleName[];
const roleSchema: yup.MixedSchema<RoleName> =
  yup.mixed<RoleName>().oneOf(ROLES_LIST, 'Rol inválido').required();

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    username: yup.string().required('El nombre de usuario es obligatorio'),
    email: yup
      .string()
      .email('El correo debe tener un formato válido')
      .required('El correo es obligatorio'),
    password: yup
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .required('La contraseña es obligatoria'),
    roles: yup
      .array()
      .of(roleSchema)
      .min(1, 'Debes seleccionar al menos un rol')
      .required('Debes seleccionar al menos un rol'),
  })
  .required();

const AddUserForm: React.FC = () => {
  const { create, validateUnique } = useUsers();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { username: '', email: '', password: '', roles: [] },
  });

  const selected = watch('roles') ?? [];
  const hasFieldErrors = !!(errors.username || errors.email || errors.password || errors.roles);

  const onSubmit = async (v: FormValues) => {
    try {
      await create.mutateAsync(v);
      reset();
    } catch (err: any) {
      if (
        err?.code === 'DUPLICATE_KEY' &&
        (err.field === 'email' || err.field === 'username')
      ) {
        setError(err.field as 'email' | 'username', {
          type: 'server',
          message: err.message || 'Ya existe un registro con ese valor.',
        });
      } else {
        setError('root', {
          type: 'server',
          message: err?.message || 'No se pudo crear el usuario.',
        });
      }
    }
  };

  return (
   
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {}
      {errors.root?.message && !hasFieldErrors && (
        <div className="rounded bg-red-50 border border-red-200 p-2 text-red-700">
          {errors.root.message}
        </div>
      )}

      {}
      <div>
        <input
          className={`w-full p-3 border rounded ${
            errors.username ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300'
          }`}
          placeholder="Nombre de usuario"
          {...register('username', {
            onBlur: async (e) => {
              const res = await validateUnique('username', e.target.value);
              if (res === false)
                setError('username', { type: 'server', message: 'Ese usuario ya existe' });
              else if (res === true || res === 'skip') clearErrors('username');
            },
          })}
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
      </div>

      {}
      <div>
        <input
          type="email"
          className={`w-full p-3 border rounded ${
            errors.email ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300'
          }`}
          placeholder="Correo electrónico"
          {...register('email', {
            onBlur: async (e) => {
              const res = await validateUnique('email', e.target.value);
              if (res === false)
                setError('email', { type: 'server', message: 'Ese correo ya existe' });
              else if (res === true || res === 'skip') clearErrors('email');
            },
          })}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {}
      <div>
        <input
          type="password"
          className={`w-full p-3 border rounded ${
            errors.password ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-300'
          }`}
          placeholder="Contraseña"
          {...register('password')}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {}
      <div>
        <p className="font-medium mb-2">Roles</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROLES_LIST.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(r)}
                onChange={() => {
                  const next = selected.includes(r)
                    ? selected.filter((x) => x !== r)
                    : [...selected, r];
                  setValue('roles', next as RoleName[], { shouldValidate: true });
                }}
              />
              <span>{ROLE_LABELS[r]}</span>
            </label>
          ))}
        </div>
        {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles.message as string}</p>}
      </div>

      {}
      <button
        type="submit"
        disabled={isSubmitting || create.isPending}
        className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-2xl"
      >
        {isSubmitting || create.isPending ? 'Creando…' : 'Crear usuario'}
      </button>
    </form>
  );
};

export default AddUserForm;
