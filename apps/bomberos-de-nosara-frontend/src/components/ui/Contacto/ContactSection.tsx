import PhoneButton from "./PhoneButton";
import HeroContact from "./HeroContact";
import { contactParagraphs } from "../../../data/contactData";



export default function ContactSection(){
    return(
       <section className="w-full bg-red-800 text-white px-6 py-20">
 <div className="w-full text-center space-y-6 px-4">

    <h2 className="text-3xl md:text-4xl font-light leading-snug">
      Bienvenido al Sitio Web Oficial de La Asociación Bomberos de Nosara.
    </h2>

    <p className="text-base md:text-lg text-gray-100">
      Los Bomberos de Nosara ayudan a garantizar servicios de emergencia oportunos para la comunidad porque, en caso de emergencia, ¡cada segundo cuenta!
    </p>
    <p className="text-base md:text-lg text-gray-100">
      Para emergencias, tenemos un teléfono celular de servicio, <span className="font-semibold text-white">+506 8709 0614</span>
    </p>
    <p className="text-base md:text-lg text-gray-100">
      Somos un departamento de bomberos voluntarios en Nosara. Contamos con 9 bomberos y dos unidades extintoras. ¡Necesitamos tu ayuda!
    </p>

    <a
      href="tel:+50687090614"
      className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-4 bg-white text-red-700 font-bold rounded-md shadow hover:bg-gray-100 transition"
    >
       LLAMAR +506 8709 0614
    </a>

    <p className="text-sm text-gray-300 mt-10">
      © {new Date().getFullYear()} Asociación Bomberos de Nosara. Todos los derechos reservados.
    </p>
  </div>
</section>

    )
}