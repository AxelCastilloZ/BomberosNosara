// src/components/ui/alert.tsx
import React from 'react';

type AlertVariant = 'default' | 'destructive' | 'warning' | 'success';

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  actions?: AlertAction[];
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', children, actions, ...props }, ref) => {
    const variantClasses: Record<AlertVariant, string> = {
      default: 'bg-blue-50 text-blue-900 border-blue-200',
      destructive: 'bg-red-50 text-red-900 border-red-200',
      warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      success: 'bg-green-50 text-green-900 border-green-200',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
        
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"  // 🔥 ESTE ES EL CAMBIO CRÍTICO
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${action.variant === 'destructive'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`text-sm leading-relaxed flex items-start gap-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };