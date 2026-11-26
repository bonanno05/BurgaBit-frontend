import { Link } from 'react-router';
import hamburguesa from '../assets/burguer.webp';

//lo primero que se ve al entrar al link sin sesión.

function Bienvenida() {
  return (
    <div className="bienvenida">
      <div className="bienvenida-contenido">
        <div className="bienvenida-marca">
          <div className="bienvenida-rayos"></div>
          <img className="bienvenida-hamburguesa" src={hamburguesa} alt=""/> 
          <h1 className="bienvenida-titulo">¡Bienvenido a BurgaBit!</h1>
        </div>

        <p className="bienvenida-texto">Armá tu hamburguesa a tu gusto.</p>
        
        <Link to="/login" className="bienvenida-boton">
          Comenzar
        </Link>
      </div>
    </div>
  );
}

export default Bienvenida;