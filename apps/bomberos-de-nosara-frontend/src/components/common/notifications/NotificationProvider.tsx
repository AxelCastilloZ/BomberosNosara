// src/components/common/notifications/NotificationProvider.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Notification, NotificationContextValue, NotificationOptions, NotificationType } from './notifications.types';

interface NotificationProviderProps {
  children: ReactNode;
}

// Componente Toast interno
interface ToastProps extends Notification {
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  title, 
  onClose,
  actions = []
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div 
      className={`
        flex items-start p-4 rounded-lg border shadow-lg max-w-md w-full
        transition-all duration-300 ease-in-out transform
        ${getBackgroundColor()}
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-medium text-gray-900 mb-1">
            {title}
          </div>
        )}
        <div className="text-sm text-gray-700">
          {message}
        </div>
        
        {actions.length > 0 && (
          <div className="mt-2 flex gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`
                  px-3 py-1 text-xs font-medium rounded-md transition-colors
                  ${action.type === 'primary' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }
                `}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        onClick={handleClose}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Context
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Provider Component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>): string => {
    const id = `${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      id,
      ...notification,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove después del tiempo especificado
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);

    return id;
  }, []);

  const removeNotification = useCallback((id: string): void => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback((): void => {
    setNotifications([]);
  }, []);

  // Métodos de conveniencia
  const success = useCallback((message: string, options: NotificationOptions = {}): string => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message: string, options: NotificationOptions = {}): string => {
    return addNotification({
      type: 'error',
      message,
      duration: 7000, // Los errores duran más
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message: string, options: NotificationOptions = {}): string => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message: string, options: NotificationOptions = {}): string => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Container de notificaciones */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook para usar las notificaciones
export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};