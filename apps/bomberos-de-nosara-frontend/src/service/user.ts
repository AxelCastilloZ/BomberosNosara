
import api from './../api/apiConfig';
import axios from 'axios';
import type { User, CreateUserDto, UpdateUserDto, ApiFieldError } from '../types/user';


function toReadableMessage(input: unknown): string {
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    return input.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(', ');
  }
  if (input && typeof input === 'object') {
    const maybe = (input as any).message;
    if (maybe !== undefined) return toReadableMessage(maybe);
    try {
      return JSON.stringify(input);
    } catch {
      return 'Error desconocido';
    }
  }
  return '';
}


function translateToSpanish(msg: string): string {
  
  const m = msg.trim();

  
  const patterns: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
    [/email must be an email/i, () => 'El correo debe tener un formato válido'],
    [/(\w+) should not be empty/i, (mm) => `El campo ${mm[1]} no debe estar vacío`],
    [/(\w+) must be a string/i, (mm) => `El campo ${mm[1]} debe ser un texto`],
    [/(\w+) must be longer than or equal to (\d+) characters/i, (mm) =>
      `El campo ${mm[1]} debe tener al menos ${mm[2]} caracteres`
    ],
    [/(\w+) must be shorter than or equal to (\d+) characters/i, (mm) =>
      `El campo ${mm[1]} debe tener como máximo ${mm[2]} caracteres`
    ],
    [/(\w+) must be a valid enum value/i, (mm) => `El campo ${mm[1]} tiene un valor inválido`],
    [/(\w+) must be an array/i, (mm) => `El campo ${mm[1]} debe ser una lista`],
    [/(\w+) must be a number/i, (mm) => `El campo ${mm[1]} debe ser un número`],
  ];

  for (const [re, fn] of patterns) {
    const mm = m.match(re);
    if (mm) return fn(mm);
  }

  return m; 
}


function normalizeError(err: unknown, fallback = 'Error de usuarios'): ApiFieldError {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;

    
    const raw =
      toReadableMessage(data?.message) ||
      toReadableMessage(data?.error) ||
      fallback;

    const msg = typeof raw === 'string' ? translateToSpanish(raw) : fallback;

    
    const code: string | undefined =
      data?.code ?? (err.response?.status === 409 ? 'DUPLICATE_KEY' : undefined);
    const field: string | undefined = data?.field;

    const lower = typeof raw === 'string' ? raw.toLowerCase() : '';
    if (code === 'DUPLICATE_KEY' || lower.includes('duplicate') || lower.includes('ya existe')) {
      let inferredField: 'email' | 'username' | string | undefined = field;
      if (!inferredField) {
        if (lower.includes('email') || lower.includes('correo')) inferredField = 'email';
        else if (lower.includes('username') || lower.includes('usuario')) inferredField = 'username';
      }
      return { code: 'DUPLICATE_KEY', message: msg, field: inferredField };
    }

    if (code) return { code: code as any, message: msg, field };
    return { code: 'UNKNOWN', message: msg };
  }

  return { code: 'UNKNOWN', message: fallback };
}



export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  try {
    const { data } = await api.post<User>('/users', dto);
    return data;
  } catch (err) {
    throw normalizeError(err, 'No se pudo crear el usuario');
  }
}

export async function updateUser(id: number, dto: UpdateUserDto): Promise<User> {
  try {
    const { data } = await api.put<User>(`/users/${id}`, dto);
    return data;
  } catch (err) {
    throw normalizeError(err, 'No se pudo actualizar el usuario');
  }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/users/${id}`);
  } catch (err) {
    throw normalizeError(err, 'No se pudo eliminar el usuario');
  }
}


export async function checkUnique(
  field: 'email' | 'username',
  value: string
): Promise<boolean> {
  const { data } = await api.get('/users/unique', { params: { field, value } });
  if (typeof data?.unique === 'boolean') return data.unique;
  if (typeof data?.exists === 'boolean') return !data.exists;
  throw new Error('Unknown unique response');
}
