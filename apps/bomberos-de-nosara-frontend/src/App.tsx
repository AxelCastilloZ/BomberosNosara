import { Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import './App.css';
import Navbar from './components/common/Navbar';

export default function App() {
  const { location }=useRouterState();

  // Reset scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* Main content area with padding to account for fixed navbar */}
      <main className="flex-1 pt-16 sm:pt-18 md:pt-20 px-0">
        <div className="w-full max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
