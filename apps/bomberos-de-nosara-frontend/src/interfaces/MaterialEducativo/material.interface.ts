export type MaterialTipo = 'PDF' | 'Video' | 'Documento' | 'Imagen';

export interface MaterialEducativo {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: MaterialTipo;
  url: string;
  vistaPrevia?: string; // Opcional para videos o imágenes
}
