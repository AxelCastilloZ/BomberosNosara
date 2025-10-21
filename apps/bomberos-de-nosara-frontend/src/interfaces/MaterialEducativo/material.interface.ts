export type MaterialTipo = 'PDF' | 'Video' | 'Documento' | 'Imagen';

export interface MaterialEducativo {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: MaterialTipo;
  url: string;
  vistaPrevia?: string;
  area?: string;

  // === Campos de auditoría (IDs numéricos) ===
  createdBy: number;
  updatedBy: number;
  deletedBy?: number | null;

  // === Fechas ===
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  // === Relaciones (objetos completos del backend) ===
  createdByUser?: {
    id: number;
    username: string;
    email: string;
    nombre?: string;
    apellido?: string;
    telefono?: string;
  };
  
  updatedByUser?: {
    id: number;
    username: string;
    email: string;
    nombre?: string;
    apellido?: string;
  };
  
  deletedByUser?: {
    id: number;
    username: string;
    email: string;
    nombre?: string;
    apellido?: string;
  } | null;
}