import { useForm } from "@tanstack/react-form";
import { Noticia } from "apps/bomberos-de-nosara-frontend/src/types/news";
import { useState } from "react";
import { z } from "zod";

// 1. Esquema Zod
const noticiaSchema = z.object({
  titulo: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede superar 100 caracteres"),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  url: z.string().optional(),
  fecha: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "La fecha no es válida")
    .refine(
      (val) => new Date(val) <= new Date(),
      "La fecha no puede ser futura"
    ),
});

// 2. Tipo inferido
type NoticiaFormValues = z.infer<typeof noticiaSchema>;

// 3. Props tipadas sin "any"
interface Props {
  noticia: Noticia | null;
  onClose: () => void;
  onSave: (values: NoticiaFormValues, file?: File | null) => void;
}

// 4. Componente
export default function NoticiasForm({ noticia, onClose, onSave }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(noticia?.url || "");

  const form = useForm({
    defaultValues: {
      titulo: noticia?.titulo || "",
      descripcion: noticia?.descripcion || "",
      url: noticia?.url || "",
      fecha: noticia?.fecha || "",
    },
    onSubmit: async ({ value }) => {
      onSave(value, selectedFile);
      form.reset();
      setSelectedFile(null);
      setPreviewUrl("");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setFieldValue("url", "");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl">
        <h2 className="text-xl font-bold text-red-700 mb-4 text-center">
          {noticia ? "Editar Noticia" : "Agregar Noticia"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Título */}
          <form.Field
            name="titulo"
            validators={{
              onChange: ({ value }) => {
                const result = noticiaSchema.shape.titulo.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues.map((e) => e.message);
              },
            }}
          >
            {(field) => (
              <div>
                <input
                  placeholder="Título"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-red-600 text-sm mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Descripción */}
          <form.Field
            name="descripcion"
            validators={{
              onChange: ({ value }) => {
                const result =
                  noticiaSchema.shape.descripcion.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues.map((e) => e.message);
              },
            }}
          >
            {(field) => (
              <div>
                <textarea
                  placeholder="Descripción"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-red-600 text-sm mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Imagen */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Imagen de la Noticia
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
            {!noticia && !selectedFile && !previewUrl && (
              <p className="text-red-700 text-sm mt-1">
                La imagen es obligatoria
              </p>
            )}
          </div>

          {/* Fecha */}
          <form.Field
            name="fecha"
            validators={{
              onChange: ({ value }) => {
                const result = noticiaSchema.shape.fecha.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues.map((e) => e.message);
              },
            }}
          >
            {(field) => (
              <div>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-red-600 text-sm mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Botones */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                !form.state.canSubmit ||
                (!noticia && !selectedFile && !previewUrl)
              }
              className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {noticia ? "Actualizar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}