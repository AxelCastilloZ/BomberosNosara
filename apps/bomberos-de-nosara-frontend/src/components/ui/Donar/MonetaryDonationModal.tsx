import React from 'react';
import { useTranslation } from 'react-i18next';
import { DonationModalProps } from './types';

export const MonetaryDonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
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
          {t('donate.modal.monetary.title')}
        </h3>

        <div className="space-y-6 text-gray-700">
          <p className="text-lg text-center">
            {t('donate.modal.monetary.description')}
          </p>

          {/* Opciones de Donación */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Donación Única */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition-colors">
              <h4 className="text-xl font-semibold mb-3 text-gray-800">
                {t('donate.modal.monetary.oneTime.title')}
              </h4>
              <p className="text-gray-600 mb-4">
                {t('donate.modal.monetary.oneTime.description')}
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  {t('donate.modal.monetary.oneTime.benefit1')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  {t('donate.modal.monetary.oneTime.benefit2')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  {t('donate.modal.monetary.oneTime.benefit3')}
                </li>
              </ul>
              <a
                href="https://www.classy.org/give/216044/#!/donation/checkout"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
              >
                {t('donate.modal.monetary.oneTime.button')}
              </a>
              <a
                href="https://www.amigosofcostarica.org/affiliates/asociacion-bomberos-de-nosara"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                {t('donate.modal.monetary.oneTime.alternative')}
              </a>
            </div>

            {/* Donación Mensual */}
            <div className="border-2 border-red-300 bg-red-50 rounded-xl p-6 relative">
              <h4 className="text-xl font-semibold mb-3 text-red-800">
                {t('donate.modal.monetary.monthly.title')}
              </h4>
              <p className="text-gray-600 mb-4">
                {t('donate.modal.monetary.monthly.description')}
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  {t('donate.modal.monetary.monthly.benefit1')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  {t('donate.modal.monetary.monthly.benefit2')}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-red-600">✓</span>
                  {t('donate.modal.monetary.monthly.benefit3')}
                </li>
              </ul>
              <a
                href="https://fundthebomberos.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300"
              >
                {t('donate.modal.monetary.monthly.button')}
              </a>
            </div>
          </div>

          {/* Transferencia Bancaria */}
          <div className="bg-gray-50 rounded-xl p-6 mt-6">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">
              {t('donate.modal.monetary.bank.title')}
            </h4>
            <p className="text-gray-600 mb-4">
              {t('donate.modal.monetary.bank.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  {t('donate.modal.monetary.bank.usd')}
                </p>
                <p className="text-lg font-mono font-bold text-gray-800">CR34015201001046436314</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  {t('donate.modal.monetary.bank.crc')}
                </p>
                <p className="text-lg font-mono font-bold text-gray-800">CR44015201001046436231</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              {t('donate.modal.monetary.bank.footer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};