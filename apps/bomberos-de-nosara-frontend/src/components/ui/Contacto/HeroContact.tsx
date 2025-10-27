import { contactHero } from "../../../data/contactData";


export default function HeroContact(){
    return (
        <h1 className="text-3xl md:text-4xl font-light text-gray-800 leading-snug text-center mb-6 ">
            {contactHero}
        </h1>
    )
}