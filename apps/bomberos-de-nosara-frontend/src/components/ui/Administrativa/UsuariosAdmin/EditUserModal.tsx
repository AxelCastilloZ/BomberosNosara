import React, { useState } from 'react';
import { updateUser } from '../../../../service/userService';




interface EditUserModalProps {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
  onClose: () => void;
  onUpdated: () => void;
}

const EditUserModal = ({ user, onClose, onUpdated }: EditUserModalProps) => {
  const [nombre, setNombre] = useState(user.nombre);
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState(user.rol);

  const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await updateUser(user.id, {
      username: nombre,
      password: password || undefined, // solo si se escribió
      roles: [rol],
    });

    alert(`Usuario actualizado:\nNombre: ${nombre}\nRol: ${rol}`);
    onClose();
    await onUpdated(); // Esto es lo que refresca la lista
  } catch (err) {
    alert('Error al actualizar usuario');
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Nombre"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Nueva contraseña (opcional)"
          />

          <div className="space-y-2">
            <label className="block">
              <input
                type="radio"
                name="role"
                value="ADMIN"
                checked={rol === 'ADMIN'}
                onChange={(e) => setRol(e.target.value)}
              />
              ADMIN
            </label>
            <label className="block">
              <input
                type="radio"
                name="role"
                value="PERSONAL_BOMBERIL"
                checked={rol === 'PERSONAL_BOMBERIL'}
                onChange={(e) => setRol(e.target.value)}
              />
              PERSONAL_BOMBERIL
            </label>
            <label className="block">
              <input
                type="radio"
                name="role"
                value="VOLUNTARIO"
                checked={rol === 'VOLUNTARIO'}
                onChange={(e) => setRol(e.target.value)}
              />
              VOLUNTARIO
            </label>
          </div>


          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
