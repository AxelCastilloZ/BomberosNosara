// src/components/common/notifications.types.ts
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  type?: 'primary' | 'secondary';
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  actions?: NotificationAction[];
  timestamp: Date;
}

export interface NotificationOptions {
  title?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (message: string, options?: NotificationOptions) => string;
  error: (message: string, options?: NotificationOptions) => string;
  warning: (message: string, options?: NotificationOptions) => string;
  info: (message: string, options?: NotificationOptions) => string;
}