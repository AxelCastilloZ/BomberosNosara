import React, { useState } from 'react';

interface EditUserModalProps {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
  onClose: () => void;
}

const EditUserModal = ({ user, onClose }: EditUserModalProps) => {
  const [nombre, setNombre] = useState(user.nombre);
  const [email, setEmail] = useState(user.email);
  const [rol, setRol] = useState(user.rol);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Usuario actualizado:', { nombre, email, rol });
    onClose();
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
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Correo"
          />
          <select
            value={rol}
            onChange={e => setRol(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="admin">Administrador</option>
            <option value="bombero">Bombero</option>
          </select>

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
