


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import translationES from './locales/es/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  }
};

i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Pasar la instancia de i18n a react-i18next
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    lng: 'es', // Idioma inicial
    debug: false, // Cambiar a true para ver logs en desarrollo
    
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },

    detection: {
      // Orden de detección del idioma
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Guardar preferencia en localStorage
    }
  });

export default i18n;