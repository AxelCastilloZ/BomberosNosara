import React from 'react';
import { Outlet } from '@tanstack/react-router';
import Navbar from './components/common/Navbar';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* El Navbar se auto-oculta en /admin */}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
