import React from 'react';
import { useTranslation } from 'react-i18next';
import { DonationModalProps } from './types';
import { WhatsAppDonationButton } from './WhatsAppDonationButton';

export const ResourceDonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-light"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="bg-gray-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-white">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <h3 className="text-3xl font-serif mb-6 text-center text-gray-800">
          {t('donate.modal.resources.title')}
        </h3>

        <div className="space-y-6 text-gray-700">
          <p className="text-lg">
            {t('donate.modal.resources.description')}
          </p>

          <div>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">
              {t('donate.modal.resources.whatToDonate')}
            </h4>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="mr-2 text-gray-600">•</span>
                <span>
                  <strong>{t('donate.modal.resources.equipment.title')}</strong> {t('donate.modal.resources.equipment.description')}
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-gray-600">•</span>
                <span>
                  <strong>{t('donate.modal.resources.vehicles.title')}</strong> {t('donate.modal.resources.vehicles.description')}
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-gray-600">•</span>
                <span>
                  <strong>{t('donate.modal.resources.other.title')}</strong> {t('donate.modal.resources.other.description')}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-3 text-gray-800">
              {t('donate.modal.resources.howToDonate')}
            </h4>
            <p className="mb-4">
              {t('donate.modal.resources.contactInfo')}
            </p>

            <WhatsAppDonationButton donationType="recursos materiales">
              <span className="w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('donate.modal.resources.whatsappButton')}
              </span>
            </WhatsAppDonationButton>
          </div>
        </div>
      </div>
    </div>
  );
};