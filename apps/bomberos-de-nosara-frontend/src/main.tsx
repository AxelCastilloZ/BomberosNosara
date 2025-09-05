import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminAuthProvider } from './auth/AdminAuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { LayoutProvider } from './context/LayoutContext';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <SocketProvider>
          <LayoutProvider>
            <RouterProvider router={router} />
          </LayoutProvider>
        </SocketProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
