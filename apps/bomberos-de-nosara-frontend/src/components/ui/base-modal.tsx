

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface BaseModalProps {
  // Control del modal
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Header
  title?: string;
  description?: string;
  
  // Contenido principal
  children: React.ReactNode;
  
  // Tamaño del modal
  size?: ModalSize;
  
  // Footer
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  
  // Customización adicional
  className?: string;
  contentClassName?: string;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export const BaseModal: React.FC<BaseModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'lg',
  showFooter = true,
  footerContent,
  className = '',
  contentClassName = '',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`w-[95vw] ${SIZE_CLASSES[size]} ${className}`}
        style={{
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Content Area - Scrolleable */}
        <div className={`overflow-y-auto px-6 py-4 flex-1 ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <DialogFooter className="px-6 py-4 border-t">
            {footerContent}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};