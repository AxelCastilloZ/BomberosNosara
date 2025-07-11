import TituloDonar from "./TituloDonar";
import Description from "./Description";
import ButtonDonate from "./ButtonDonate";


export default function DonateSection(){
    return(
    <section className="w-full bg-white px-6 py-16">
       <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
             <TituloDonar/>
             <Description/>
             <ButtonDonate/>
          </div>
       </div>
    </section>
    )
}