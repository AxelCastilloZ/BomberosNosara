import React from 'react';
import { DonationModalProps } from './types';

export const MonetaryDonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-light"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="bg-red-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-white">
          <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 className="text-3xl font-serif mb-6 text-center text-red-800">
          Donación Monetaria
        </h3>

        <div className="space-y-6 text-gray-700">
          <p className="text-lg text-center">
            Tu apoyo financiero tiene un impacto directo en nuestra capacidad de responder a emergencias y salvar vidas en la comunidad de Nosara.
          </p>

          {/* Opciones de Donación */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Donación Única */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition-colors">
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Donación Única</h4>
              <p className="text-gray-600 mb-4">
                Haz una contribución de un solo pago para apoyar nuestras operaciones inmediatas.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  Cualquier monto
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  Impacto inmediato
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  Deducible de impuestos
                </li>
              </ul>
              <a
                href="https://www.classy.org/give/216044/#!/donation/checkout"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
              >
                Donar Una Vez
              </a>
              <a
                href="https://www.amigosofcostarica.org/affiliates/asociacion-bomberos-de-nosara"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Opción alternativa de pago
              </a>
            </div>

            {/* Donación Mensual */}
            <div className="border-2 border-red-300 bg-red-50 rounded-xl p-6 relative">
              <h4 className="text-xl font-semibold mb-3 text-red-800">Cuota de Servicios de Emergencia</h4>
              <p className="text-gray-600 mb-4">
                Conviértete en un apoyo constante con una contribución mensual. Ideal para residentes y negocios.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  Desde $60 o $100/mes
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  Apoyo continuo y predecible
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  Mayor impacto a largo plazo
                </li>
              </ul>
              <a
                href="https://fundthebomberos.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
              >
                Suscribirse Mensualmente
              </a>
            </div>
          </div>

          {/* Transferencia Bancaria */}
          <div className="bg-gray-50 rounded-xl p-6 mt-6">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Transferencia Bancaria en Costa Rica</h4>
            <p className="text-gray-600 mb-4">
              Para empresas o personas que prefieren transferir directamente en Costa Rica, pueden usar nuestras cuentas del Banco de Costa Rica:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Cuenta en Dólares (USD)</p>
                <p className="text-lg font-mono font-bold text-gray-800">CR34015201001046436314</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Cuenta en Colones (CRC)</p>
                <p className="text-lg font-mono font-bold text-gray-800">CR44015201001046436231</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Banco de Costa Rica (BCR) • Asociación Bomberos de Nosara
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
