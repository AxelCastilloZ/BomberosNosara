// components/ui/Donar/DonationTypesSection.tsx
import React from 'react';
import { WhatsAppDonationButton } from './WhatsAppDonationButton';

interface DonationType {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
  iconBg: string;
  buttonColor: string;
  buttonHoverColor: string;
  actionType: 'whatsapp' | 'amigos';
  whatsappType?: string;
  highlighted?: boolean;
}

const donationTypes: DonationType[] = [
  {
    id: 'equipo',
    title: 'Donar Equipo Bomberil',
    description: 'Equipos de protección personal, herramientas especializadas y tecnología de rescate que salvan vidas.',
    benefits: [
      'Herramientas especializadas de rescate',
      'Equipos de protección personal certificados',
      'Tecnología de última generación',
      'Impacto inmediato en la comunidad'
    ],
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),

    iconBg: 'bg-gray-600',
    buttonColor: 'bg-gray-600',
    buttonHoverColor: 'hover:bg-gray-700',
    actionType: 'whatsapp',
    whatsappType: 'equipo bomberil',
    highlighted: false
  },
  {
    id: 'monetaria',
    title: 'Donación Monetaria',
    description: 'La forma más directa y efectiva de apoyar nuestras operaciones de emergencia y salvar vidas.',
    benefits: [
      'Organización 501(c)(3) Certificada',
      'Deducible de impuestos en EE. UU.',
      'Seguro y rápido',
      'Impacto inmediato en la comunidad'
    ],
    icon: (
      <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-red-600',
    buttonColor: 'bg-red-600',
    buttonHoverColor: 'hover:bg-red-700',
    actionType: 'amigos',
    highlighted: true
  },
  {
    id: 'vehiculos',
    title: 'Donar Vehículos de Emergencia',
    description: 'Transporte especializado para respuesta rápida y operaciones de rescate complejas.',
    benefits: [
      'Camiones de bomberos especializados',
      'Ambulancias y vehículos médicos certificados',
      'Vehículos todo terreno para rescate',
      'Sistemas de comunicación avanzados'
    ],
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),

    iconBg: 'bg-gray-600',
    buttonColor: 'bg-gray-600',
    buttonHoverColor: 'hover:bg-gray-700',
    actionType: 'whatsapp',
    whatsappType: 'vehículos de emergencia',
    highlighted: false
  }
];

export const TiposDonacionesSection = () => {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-serif font-light text-center mb-16">
          Tipos de Donaciones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {donationTypes.map((type) => (
            <div
              key={type.id}
              className={`
                ${type.highlighted 
                  ? 'md:col-span-1 md:scale-110 bg-red-50 border-2 border-red-200 shadow-2xl z-10' 
                  : 'bg-white shadow-lg'
                }
                rounded-2xl p-8 transition-all duration-300 hover:shadow-xl flex flex-col h-full
              `}
            >
              {/* Icono con color independiente */}
              <div className={`${type.iconBg} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-white`}>
                {type.icon}
              </div>
              
              <h3 className={`text-2xl font-serif mb-4 ${type.highlighted ? 'text-3xl text-red-800' : ''}`}>
                {type.title}
              </h3>
              
              <p className="text-gray-600 mb-6 text-center flex-grow">
                {type.description}
              </p>
              
              {/* Beneficios */}
              <ul className="text-sm text-gray-500 mb-8 space-y-2">
                {type.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`mr-2 ${type.highlighted ? 'text-red-600' : 'text-gray-600'}`}>✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              
              {/* Botón de acción con color personalizado */}
              <div className="mt-auto pt-6">
                {type.actionType === 'whatsapp' ? (
                  <WhatsAppDonationButton donationType={type.whatsappType || type.title}>
                    <span className={`inline-block w-full text-center ${type.buttonColor} ${type.buttonHoverColor} text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300`}>
                      Donar {type.title.split(' ')[1]}
                    </span>
                  </WhatsAppDonationButton>
                ) : (
                  <a
                    href="https://www.classy.org/give/216044/#!/donation/checkout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block w-full text-center ${type.buttonColor} ${type.buttonHoverColor} text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300`}
                  >
                    Donar Ahora
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};