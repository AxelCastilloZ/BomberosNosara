import React from 'react';

interface WhatsAppDonationButtonProps {
  donationType: string;
  children: React.ReactNode;
}

export const WhatsAppDonationButton: React.FC<WhatsAppDonationButtonProps> = ({ 
  donationType, 
  children 
}) => {
  const phoneNumber = '50683421441'; 
  const message = encodeURIComponent(
    `Hola, me gustaría obtener más información sobre cómo realizar una donación de ${donationType} para Bomberos de Nosara.`
  );
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="transition transform hover:-translate-y-1 duration-300 text-white font-bold py-2 px-4 rounded-2xl inline-block text-sm"
    >
      {children}
    </a>
  );
};