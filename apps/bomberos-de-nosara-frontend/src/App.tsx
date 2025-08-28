import { Outlet } from '@tanstack/react-router';
import './App.css'
import Navbar from './components/common/Navbar';


export default function App() {
  return (
    <div className="min-h-screen  bg-white font-sans overflow-x-hidden">
      <Navbar />
     
      <Outlet />
    </div>
  );
}
