


import type { User, RoleName } from '../../../types';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateUsuarioDto {
  username: string;
  email: string;
  password: string;
  roles: RoleName[];
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export interface UpdateUsuarioDto {
  username?: string;
  email?: string;
  password?: string;
  roles?: RoleName[];
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

// ============================================================================
// Props de Componentes
// ============================================================================

export interface CrearUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface EditarUsuarioModalProps {
  usuario: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface EliminarUsuarioModalProps {
  usuario: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ListaUsuariosProps {
  onEdit: (usuario: User) => void;
  onDelete: (usuario: User) => void;
}

// ============================================================================
// Filtros
// ============================================================================

export interface UsuarioFilters {
  search?: string;
  role?: RoleName | 'Todos';
}

// ============================================================================
// API Errors
// ============================================================================

export interface ApiFieldError {
  code: 'DUPLICATE_KEY' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  field?: 'email' | 'username' | string;
}

// ============================================================================
// Re-exports (para conveniencia)
// ============================================================================

export type { User, RoleName } from '../../../types';