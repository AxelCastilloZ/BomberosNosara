import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traducciones en línea (temporal - luego las movemos a archivos)
const translationES = {
  "nav": {
    "aboutUs": "Sobre Nosotros",
    "ourWork": "Nuestro Trabajo",
    "donors": "Donantes",
    "news": "Noticias",
    "donate": "Donar"
  },
  "hero": {
    "title": "Bienvenido a Bomberos Nosara",
    "description": "Nos dedicamos a servir a la comunidad de Nosara con compromiso, integridad y acción. Conocé más sobre nuestros aliados y cómo podés apoyar nuestra labor.",
    "btnLearnMore": "Conócenos",
    "btnSupport": "¿Cómo apoyar?"
  },
  "about": {
    "title": "Sobre Nosotros",
    "subtitle": "Los bomberos son esenciales para la seguridad de nuestras comunidades locales.",
    "ourHistory": "Nuestra Historia",
    "paragraph1": "Hace sólo una década, la atención de un grave incendio en Nosara requería esperar que el departamento regional de Bomberos viajara más de una hora en carreteras en mal estado. A pesar de los mejores esfuerzos, su hora de llegada a menudo es demasiado tarde.",
    "paragraph2": "En noviembre de 2009, un residente local decidió que este retraso no era aceptable en una situación de vida o muerte y que era necesaria una respuesta local. Armado con equipo básico de bomberos donado, pidió la ayuda de más voluntarios. La llamada fue respondida por un pequeño y comprometido equipo de servidores públicos desinteresados y listos para emprender la lucha.",
    "paragraph3": "Una década después de su formación, estos voluntarios han salvado innumerables hogares, vidas y medios de sustento y se han convertido en un recurso comunitario indispensable y muy utilizado. Estos Bomberos permanecen de guardia día y noche para estar donde sea necesario en cualquier momento y la única razón por la que logran seguir adelante es gracias a donaciones.",
    "paragraph4": "Aunque han recibido capacitaciones de alto nivel, estos hombres y mujeres, muchos de los cuales tienen trabajos a tiempo completo y/o familias, no son profesionales. Al principio, los gastos como equipo de protección, herramientas, transporte, suministros y mucho más, salieron de su propio bolsillo. A medida que aumentaba el volumen de llamadas, este modelo de financiación se volvió insostenible. Hoy en día, la única razón por la cual el equipo voluntario de bomberos de Nosara es más fuerte, más rápido, mejor capacitado y mejor equipado que nunca es por las donaciones que recibe."
  },
  "work": {
    "title": "Nuestro Trabajo",
    "subtitle": "Comprometidos con la seguridad y bienestar de nuestra comunidad",
    "services": {
      "fires": {
        "title": "Combate de Incendios",
        "description": "Incendios forestales, estructurales, basura, eléctricos"
      },
      "medical": {
        "title": "Atención Médica",
        "description": "Atención médica de emergencia y primeros auxilios"
      },
      "coastal": {
        "title": "Emergencias Costeras",
        "description": "Respuesta rápida a emergencias en el mar y playa"
      },
      "disasters": {
        "title": "Desastres Naturales",
        "description": "Respuesta a desastres naturales y catástrofes"
      },
      "accidents": {
        "title": "Accidentes Vehiculares",
        "description": "Rescate y atención en accidentes de tránsito"
      },
      "wildlife": {
        "title": "Rescate de Animales Salvajes",
        "description": "Reubicación segura de fauna silvestre"
      },
      "education": {
        "title": "Programas Educativos",
        "description": "Capacitación y prevención en la comunidad"
      },
      "community": {
        "title": "Servicio Comunitario",
        "description": "Apoyo y asistencia a la comunidad de Nosara"
      },
      "lifeguard": {
        "title": "Guardia Costera",
        "description": "Vigilancia y rescate en zonas costeras"
      }
    }
  },
  "news": {
    "title": "Últimas Noticias",
    "subtitle": "Mantente informado sobre nuestras actividades y logros recientes",
    "readMore": "Leer más",
    "readLess": "Ver menos",
    "loading": "Cargando noticias...",
    "error": "No se pudieron cargar las noticias"
  },
  "donors": {
    "title": "Quiénes nos apoyan",
    "subtitle": "Si desea formar parte de este selecto grupo, envíe un correo a:",
    "email": "donaciones@bomberosdenosara.org",
    "readMore": "Leer más",
    "readLess": "Ver menos",
    "loading": "Cargando donantes...",
    "error": "Error cargando donantes",
    "modal": {
      "close": "Cerrar",
      "visitWebsite": "Visitar sitio del donante"
    }
  },
  "donate": {
    "hero": {
      "save": "Salva",
      "lives": "Vidas",
      "withYourHelp": "Con Tu Ayuda",
      "description": "Cada donación fortalece nuestra capacidad de respuesta ante emergencias y protege a nuestra comunidad. Únete a nuestra misión de servicio y protección."
    },
    "sectionTitle": "Elige cómo quieres ayudar",
    "types": {
      "resources": {
        "title": "Donación de Recursos",
        "description": "Contribuye con equipo, vehículos y recursos materiales para nuestras operaciones de emergencia.",
        "btnText": "Ver Más Información"
      },
      "monetary": {
        "title": "Donación Monetaria",
        "description": "La forma más directa y efectiva de apoyar nuestras operaciones y salvar vidas.",
        "btnText": "Donar Ahora",
        "benefits": {
          "certified": "Organización 501(c)(3) Certificada",
          "taxDeductible": "Deducible de impuestos en EE. UU.",
          "secure": "Seguro y rápido",
          "immediate": "Impacto inmediato en la comunidad"
        }
      }
    },
    "info": {
      "paragraph1": "Como organización voluntaria, puede ser una verdadera lucha adquirir el equipo de seguridad, suministros, mantenimiento de vehículos y combustible que necesitamos. Todo esto requiere de financiamiento, que solo se puede recaudar a través de sus donaciones.",
      "paragraph2": "La Asociación Bomberos de Nosara opera como una organización sin fines de lucro afiliada a",
      "nonprofit": "Amigos Of Costa Rica (501(c)(3) exenta de impuestos)",
      "paragraph3": "Su donación es deducible dentro de las pautas de la ley de EE. UU. Conserve su recibo de donación como comprobante oficial.",
      "costaRica": "Para donaciones deducibles de impuestos en Costa Rica, contacte:"
    },
    "modal": {
      "monetary": {
        "title": "Donación Monetaria",
        "description": "Tu apoyo financiero tiene un impacto directo en nuestra capacidad de responder a emergencias y salvar vidas en la comunidad de Nosara.",
        "oneTime": {
          "title": "Donación Única",
          "description": "Haz una contribución de un solo pago para apoyar nuestras operaciones inmediatas.",
          "benefit1": "Cualquier monto",
          "benefit2": "Impacto inmediato",
          "benefit3": "Deducible de impuestos",
          "button": "Donar Una Vez",
          "alternative": "Opción alternativa de pago"
        },
        "monthly": {
          "title": "Cuota de Servicios de Emergencia",
          "description": "Conviértete en un apoyo constante con una contribución mensual. Ideal para residentes y negocios.",
          "benefit1": "Desde $60 o $100/mes",
          "benefit2": "Apoyo continuo y predecible",
          "benefit3": "Mayor impacto a largo plazo",
          "button": "Suscribirse Mensualmente"
        },
        "bank": {
          "title": "Transferencia Bancaria en Costa Rica",
          "description": "Para empresas o personas que prefieren transferir directamente en Costa Rica, pueden usar nuestras cuentas del Banco de Costa Rica:",
          "usd": "Cuenta en Dólares (USD)",
          "crc": "Cuenta en Colones (CRC)",
          "footer": "Banco de Costa Rica (BCR) • Asociación Bomberos de Nosara"
        }
      },
      "resources": {
        "title": "Donación de Recursos",
        "description": "Los Bomberos de Nosara necesitan diversos recursos materiales para llevar a cabo sus operaciones de emergencia de manera efectiva. Tu contribución de recursos puede salvar vidas.",
        "whatToDonate": "¿Qué puedes donar?",
        "equipment": {
          "title": "Equipo Bomberil:",
          "description": "Herramientas especializadas de rescate, equipos de protección personal certificados, tecnología de última generación"
        },
        "vehicles": {
          "title": "Vehículos de Emergencia:",
          "description": "Camiones de bomberos, ambulancias, vehículos todo terreno, sistemas de comunicación avanzados"
        },
        "other": {
          "title": "Otros Recursos:",
          "description": "Materiales de construcción, suministros médicos, equipos de comunicación"
        },
        "howToDonate": "¿Cómo donar?",
        "contactInfo": "Contáctanos directamente por WhatsApp para coordinar tu donación de recursos. Nuestro equipo te guiará en el proceso y te proporcionará toda la información necesaria sobre logística y recepción.",
        "whatsappButton": "Contactar por WhatsApp"
      }
    }
  },
  "footer": {
    "title": "BOMBEROS DE NOSARA",
    "subtitle": "THE VOLUNTEER FIREFIGHTERS OF NOSARA",
    "association": "Asociación Bomberos de Nosara",
    "description": "Garantizamos servicios de emergencia oportunos para la comunidad, porque en caso de emergencia,",
    "everySecond": "¡cada segundo cuenta!",
    "contact": "Contáctanos",
    "phone": "+506 8709 0614",
    "email": "info@bomberosnosara.org",
    "callButton": "Llamar +506 8709 0614",
    "copyright": "Bomberos de Nosara. Todos los derechos reservados."
  }
};

const translationEN = {
  "nav": {
    "aboutUs": "About Us",
    "ourWork": "Our Work",
    "donors": "Donors",
    "news": "News",
    "donate": "Donate"
  },
  "hero": {
    "title": "Welcome to Bomberos Nosara",
    "description": "We are dedicated to serving the Nosara community with commitment, integrity, and action. Learn more about our allies and how you can support our work.",
    "btnLearnMore": "Learn More",
    "btnSupport": "How to Support?"
  },
  "about": {
    "title": "About Us",
    "subtitle": "Firefighters are essential for the safety of our local communities.",
    "ourHistory": "Our History",
    "paragraph1": "Just a decade ago, responding to a serious fire in Nosara required waiting for the regional Fire Department to travel more than an hour on poor roads. Despite best efforts, their arrival time was often too late.",
    "paragraph2": "In November 2009, a local resident decided that this delay was unacceptable in a life-or-death situation and that a local response was necessary. Armed with donated basic firefighting equipment, he asked for help from more volunteers. The call was answered by a small and committed team of selfless public servants ready to take up the fight.",
    "paragraph3": "A decade after its formation, these volunteers have saved countless homes, lives, and livelihoods and have become an indispensable and widely used community resource. These firefighters remain on duty day and night to be wherever needed at any time, and the only reason they manage to keep going is thanks to donations.",
    "paragraph4": "Although they have received high-level training, these men and women, many of whom have full-time jobs and/or families, are not professionals. In the beginning, expenses such as protective equipment, tools, transportation, supplies, and much more came out of their own pockets. As the volume of calls increased, this funding model became unsustainable. Today, the only reason the Nosara volunteer firefighting team is stronger, faster, better trained, and better equipped than ever is because of the donations it receives."
  },
  "work": {
    "title": "Our Work",
    "subtitle": "Committed to the safety and well-being of our community",
    "services": {
      "fires": {
        "title": "Firefighting",
        "description": "Forest, structural, garbage, and electrical fires"
      },
      "medical": {
        "title": "Medical Care",
        "description": "Emergency medical care and first aid"
      },
      "coastal": {
        "title": "Coastal Emergencies",
        "description": "Rapid response to sea and beach emergencies"
      },
      "disasters": {
        "title": "Natural Disasters",
        "description": "Response to natural disasters and catastrophes"
      },
      "accidents": {
        "title": "Vehicle Accidents",
        "description": "Rescue and care in traffic accidents"
      },
      "wildlife": {
        "title": "Wildlife Rescue",
        "description": "Safe relocation of wildlife"
      },
      "education": {
        "title": "Educational Programs",
        "description": "Community training and prevention"
      },
      "community": {
        "title": "Community Service",
        "description": "Support and assistance to the Nosara community"
      },
      "lifeguard": {
        "title": "Coast Guard",
        "description": "Surveillance and rescue in coastal areas"
      }
    }
  },
  "news": {
    "title": "Latest News",
    "subtitle": "Stay informed about our recent activities and achievements",
    "readMore": "Read more",
    "readLess": "Read less",
    "loading": "Loading news...",
    "error": "Could not load news"
  },
  "donors": {
    "title": "Who Supports Us",
    "subtitle": "If you wish to be part of this select group, send an email to:",
    "email": "donaciones@bomberosdenosara.org",
    "readMore": "Read more",
    "readLess": "Read less",
    "loading": "Loading donors...",
    "error": "Error loading donors",
    "modal": {
      "close": "Close",
      "visitWebsite": "Visit donor's website"
    }
  },
  "donate": {
    "hero": {
      "save": "Save",
      "lives": "Lives",
      "withYourHelp": "With Your Help",
      "description": "Every donation strengthens our emergency response capacity and protects our community. Join our mission of service and protection."
    },
    "sectionTitle": "Choose how you want to help",
    "types": {
      "resources": {
        "title": "Resource Donation",
        "description": "Contribute equipment, vehicles, and material resources for our emergency operations.",
        "btnText": "More Information"
      },
      "monetary": {
        "title": "Monetary Donation",
        "description": "The most direct and effective way to support our operations and save lives.",
        "btnText": "Donate Now",
        "benefits": {
          "certified": "Certified 501(c)(3) Organization",
          "taxDeductible": "Tax-deductible in the U.S.",
          "secure": "Safe and fast",
          "immediate": "Immediate impact on the community"
        }
      }
    },
    "info": {
      "paragraph1": "As a volunteer organization, it can be a real struggle to acquire the safety equipment, supplies, vehicle maintenance, and fuel we need. All of this requires funding, which can only be raised through your donations.",
      "paragraph2": "The Asociación Bomberos de Nosara operates as a nonprofit organization affiliated with",
      "nonprofit": "Amigos Of Costa Rica (501(c)(3) tax-exempt)",
      "paragraph3": "Your donation is deductible within U.S. law guidelines. Keep your donation receipt as official proof.",
      "costaRica": "For tax-deductible donations in Costa Rica, contact:"
    },
    "modal": {
      "monetary": {
        "title": "Monetary Donation",
        "description": "Your financial support has a direct impact on our ability to respond to emergencies and save lives in the Nosara community.",
        "oneTime": {
          "title": "One-Time Donation",
          "description": "Make a single payment contribution to support our immediate operations.",
          "benefit1": "Any amount",
          "benefit2": "Immediate impact",
          "benefit3": "Tax-deductible",
          "button": "Donate Once",
          "alternative": "Alternative payment option"
        },
        "monthly": {
          "title": "Emergency Services Fee",
          "description": "Become a constant support with a monthly contribution. Ideal for residents and businesses.",
          "benefit1": "From $60 or $100/month",
          "benefit2": "Continuous and predictable support",
          "benefit3": "Greater long-term impact",
          "button": "Subscribe Monthly"
        },
        "bank": {
          "title": "Bank Transfer in Costa Rica",
          "description": "For businesses or individuals who prefer to transfer directly in Costa Rica, you can use our Banco de Costa Rica accounts:",
          "usd": "Dollar Account (USD)",
          "crc": "Colones Account (CRC)",
          "footer": "Banco de Costa Rica (BCR) • Asociación Bomberos de Nosara"
        }
      },
      "resources": {
        "title": "Resource Donation",
        "description": "Bomberos de Nosara needs various material resources to carry out emergency operations effectively. Your resource contribution can save lives.",
        "whatToDonate": "What can you donate?",
        "equipment": {
          "title": "Firefighting Equipment:",
          "description": "Specialized rescue tools, certified personal protective equipment, state-of-the-art technology"
        },
        "vehicles": {
          "title": "Emergency Vehicles:",
          "description": "Fire trucks, ambulances, all-terrain vehicles, advanced communication systems"
        },
        "other": {
          "title": "Other Resources:",
          "description": "Construction materials, medical supplies, communication equipment"
        },
        "howToDonate": "How to donate?",
        "contactInfo": "Contact us directly via WhatsApp to coordinate your resource donation. Our team will guide you through the process and provide all necessary information about logistics and reception.",
        "whatsappButton": "Contact via WhatsApp"
      }
    }
  },
  "footer": {
    "title": "BOMBEROS DE NOSARA",
    "subtitle": "THE VOLUNTEER FIREFIGHTERS OF NOSARA",
    "association": "Asociación Bomberos de Nosara",
    "description": "We guarantee timely emergency services for the community, because in an emergency,",
    "everySecond": "every second counts!",
    "contact": "Contact Us",
    "phone": "+506 8709 0614",
    "email": "info@bomberosnosara.org",
    "callButton": "Call +506 8709 0614",
    "copyright": "Bomberos de Nosara. All rights reserved."
  }
};

const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    lng: 'es',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;