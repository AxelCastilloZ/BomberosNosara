// src/components/ui/tabs.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ==================== TYPES ====================

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

// ==================== CONTEXT ====================

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// ==================== COMPONENTS ====================

/**
 * Tabs - Contenedor principal
 */
export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

/**
 * TabsList - Contenedor de los triggers (botones de tabs)
 */
export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
};

/**
 * TabsTrigger - Botón individual de tab
 */
export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
  disabled = false,
}) => {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm
        px-3 py-1.5 text-sm font-medium ring-offset-white
        transition-all focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-red-500 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${
          isActive
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * TabsContent - Contenido de cada tab
 */
export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
}) => {
  const { value: selectedValue } = useTabsContext();

  if (selectedValue !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
};