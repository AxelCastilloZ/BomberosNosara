import Image from "../../../images/entrenamiento.png"; 

export default function ImageBlock(){
    return(
        <div className="w-full h-full rounded-md overflow-hidden shadow-md">
             <img src="{Image}" 
             alt="Entrenamiento Bomberos Nosara" 
             className="w-full h-full object-cover" />
        </div>
    );
}