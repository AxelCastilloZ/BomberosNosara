import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutContextType={
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
};

const LayoutContext=createContext<LayoutContextType|undefined>(undefined);

// Get the initial state from localStorage if available, otherwise default to expanded (false)
const getInitialSidebarState=(): boolean => {
  if (typeof window!=='undefined') {
    const savedState=localStorage.getItem('sidebarCollapsed');
    // If no saved state, default to expanded (false)
    return savedState === null ? false : savedState==='true';
  }
  return false; // Default to expanded (not collapsed)
};

export function LayoutProvider({ children }: { children: ReactNode }) {
  // Initialize state with the value from localStorage or default to expanded (false)
  const [isSidebarCollapsed, setIsSidebarCollapsed]=useState(getInitialSidebarState);
  const [isMobileMenuOpen, setIsMobileMenuOpen]=useState(false);

  const toggleSidebar=() => {
    const newState=!isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  // Save to localStorage whenever sidebar state changes
  useEffect(() => {
    if (typeof window!=='undefined') {
      localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed]);

  return (
    <LayoutContext.Provider
      value={{
        isSidebarCollapsed,
        isMobileMenuOpen,
        toggleSidebar,
        setSidebarCollapsed: setIsSidebarCollapsed,
        setMobileMenuOpen: setIsMobileMenuOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context=useContext(LayoutContext);
  if (context===undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
