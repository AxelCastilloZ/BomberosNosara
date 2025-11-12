// src/components/ui/confirm-modal.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
  isLoading?: boolean;
  details?: Array<{
    label: string;
    value: string;
  }>;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  icon,
  isLoading = false,
  details,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div style={{ textAlign: 'center' }}>
          <DialogHeader>
            {icon && (
              <div style={{
                margin: '0 auto 1rem',
                display: 'flex',
                height: '3rem',
                width: '3rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                backgroundColor: variant === 'destructive' ? '#fee2e2' : '#dbeafe'
              }}>
                <div style={{ color: variant === 'destructive' ? '#dc2626' : '#2563eb' }}>
                  {icon}
                </div>
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Sección de detalles - ESTRUCTURA FIJA Y ESTANDARIZADA */}
        {details && details.length > 0 && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {details.map((detail, index) => (
              <p key={index} style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
                <span style={{ fontWeight: 500 }}>{detail.label}:</span> {detail.value}
              </p>
            ))}
          </div>
        )}

        <DialogFooter className="sm:justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};