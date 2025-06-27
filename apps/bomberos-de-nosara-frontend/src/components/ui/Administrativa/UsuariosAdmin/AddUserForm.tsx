import React, { useState } from 'react';

const AddUserForm = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !rol) return alert('Todos los campos son obligatorios.');

    console.log({ nombre, email, rol });
    
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Nombre completo"
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Correo electrónico"
      />
      <select
        value={rol}
        onChange={e => setRol(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecciona un rol</option>
        <option value="admin">Administrador</option>
        <option value="bombero">Bombero</option>
      </select>

      <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
        Crear Usuario
      </button>
    </form>
  );
};

export default AddUserForm;
