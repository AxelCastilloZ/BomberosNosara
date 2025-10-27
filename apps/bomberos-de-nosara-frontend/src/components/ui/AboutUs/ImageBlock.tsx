import Quemado from "../../../images/bomberos.png";

export default function ImageBlock() {
    return (
      <div className="w-full h-full rounded-md overflow-hidden shadow-md">
        <img
          src= {Quemado} 
          alt="Bomberos de Nosara"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  