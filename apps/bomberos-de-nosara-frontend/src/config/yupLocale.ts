import { setLocale } from 'yup';

setLocale({
  mixed: {
    required: 'Este campo es obligatorio',
    notType: 'Formato inválido',
    oneOf: 'El valor no es válido',
  },
  string: {
    email: 'El correo debe tener un formato válido',
    min: ({ min }) => `Debe tener al menos ${min} caracteres`,
    max: ({ max }) => `Debe tener como máximo ${max} caracteres`,
    url: 'Debe ser una URL válida',
    matches: 'Formato inválido',
  },
  number: {
    min: ({ min }) => `Debe ser mayor o igual a ${min}`,
    max: ({ max }) => `Debe ser menor o igual a ${max}`,
    integer: 'Debe ser un número entero',
    positive: 'Debe ser un número positivo',
  },
  array: {
    min: ({ min }) => `Debes seleccionar al menos ${min} elemento(s)`,
    max: ({ max }) => `Debes seleccionar como máximo ${max} elemento(s)`,
  },
  date: {
    min: ({ min }) => `Debe ser posterior a ${min}`,
    max: ({ max }) => `Debe ser anterior a ${max}`,
  },
});
