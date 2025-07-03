import TitleBlock from "./TitleBlock";
import DescriptionList from "./DescriptionList";
import ImageBlock from "./ImageBlock";
import DonateButton from "./DonateButton";

export default function OurWorkSection(){
    return(
    <section className="w-full bg-white px-6 py-16">
       <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
             <TitleBlock/>
             <DescriptionList/>
             <DonateButton/>
          </div>
          <div className="w-full md:w-1/2">
                <ImageBlock/>
          </div>
       </div>
    </section>
    )
}