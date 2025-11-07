

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';

type ConfirmVariant = 'default' | 'destructive' | 'warning';

interface ConfirmModalProps {
  // Control
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Contenido
  title: string;
  description: string;
  
  // Acciones
  onConfirm: () => void;
  onCancel?: () => void;
  
  // Tipo de confirmación
  variant?: ConfirmVariant;
  
  // Textos de botones
  confirmText?: string;
  cancelText?: string;
  
  // Estados
  isLoading?: boolean;
  
  // Icon opcional
  icon?: React.ReactNode;
}

const VARIANT_DEFAULTS: Record<ConfirmVariant, { confirmText: string; buttonVariant: 'default' | 'destructive' }> = {
  default: {
    confirmText: 'Confirmar',
    buttonVariant: 'default',
  },
  destructive: {
    confirmText: 'Eliminar',
    buttonVariant: 'destructive',
  },
  warning: {
    confirmText: 'Continuar',
    buttonVariant: 'default',
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  variant = 'default',
  confirmText,
  cancelText = 'Cancelar',
  isLoading = false,
  icon,
}) => {
  const variantConfig = VARIANT_DEFAULTS[variant];
  const finalConfirmText = confirmText || variantConfig.confirmText;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-md"
        style={{
          padding: 0,
        }}
      >
        {/* Header con icon opcional */}
        <DialogHeader className="px-6 pt-6 pb-4">
          {icon && (
            <div className="mb-4 flex justify-center">
              {icon}
            </div>
          )}
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Footer con botones */}
        <DialogFooter className="px-6 py-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            autoFocus
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variantConfig.buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : finalConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};