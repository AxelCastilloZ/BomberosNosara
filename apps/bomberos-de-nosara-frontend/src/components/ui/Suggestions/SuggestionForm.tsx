import { useState } from "react";
import emailjs from "emailjs-com";

export default function SuggestionForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    emailjs.send(
      "YOUR_SERVICE_ID",
      "YOUR_TEMPLATE_ID",
      formData,
      "YOUR_USER_ID"
    )
    .then(() => setEnviado(true))
    .catch((err) => console.error("Error al enviar:", err));
  };

  if (enviado) {
    return <p className="text-green-600 text-center mt-4">¡Gracias por tu sugerencia!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="nombre"
        placeholder="Tu nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Tu correo"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
      />
      <textarea
        name="mensaje"
        placeholder="Tu mensaje"
        value={formData.mensaje}
        onChange={handleChange}
        required
        className="w-full border px-4 py-2 rounded"
        rows={5}
      />
      <button
        type="submit"
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Enviar
      </button>
    </form>
  );
}
