

import React from 'react';
import {
  Truck,
  Ambulance,
  Car,
  Bike,
  HelpCircle,
} from 'lucide-react';
import { normalize } from './vehiculoHelpers';


const IconBase: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    {children}
  </svg>
);


export const BoatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase className={className}>
    <path d="M3 14h8l3-3 5 1-2 5H6" />
    <path d="M4 18c1.5 1 3.5 1 5 0 1.5 1 3.5 1 5 0 1.5 1 3.5 1 5 0" />
  </IconBase>
);


export const JetSkiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 15h6l2-2 5 .5 3 2.5H6" />
    <path d="M10 13l1-2h2" />
    <path d="M3 18c1.2.9 3 .9 4.2 0 1.2.9 3 .9 4.2 0 1.2.9 3 .9 4.2 0" />
  </IconBase>
);


export const AtvIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase className={className}>
    <path d="M7 10h5l2 2h3" />
    <path d="M9 10l1-2h3" />
    <circle cx="7" cy="16" r="2.5" />
    <circle cx="17" cy="16" r="2.5" />
  </IconBase>
);


export const DroneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase className={className}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M8 8L6 6M16 8l2-2M8 16l-2 2M16 16l2 2" />
  </IconBase>
);


export function getIconForType(
  type: string, 
  className = 'h-6 w-6 text-slate-600'
): React.ReactNode {
  const normalized = normalize(type);
  
  if (normalized === 'lancha rescate') return <BoatIcon className={className} />;
  if (normalized === 'jet ski') return <JetSkiIcon className={className} />;
  if (normalized === 'atv') return <AtvIcon className={className} />;
  if (normalized === 'dron reconocimiento') return <DroneIcon className={className} />;
  if (normalized === 'camion sisterna') return <Truck className={className} />;
  if (normalized === 'carro ambulancia') return <Ambulance className={className} />;
  if (normalized === 'pickup utilitario') return <Car className={className} />;
  if (normalized === 'moto') return <Bike className={className} />;
  
  return <HelpCircle className={className} />;
}