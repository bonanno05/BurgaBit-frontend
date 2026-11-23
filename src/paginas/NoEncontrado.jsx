import { useContext } from 'react';
import { Link } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import { inicioSegunRol } from '../contexto/inicioSegunRol';

// Se muestra cuando la dirección no coincide con ninguna ruta
function NoEncontrado() {
  const sesion = useContext(SesionContexto);
  const inicio = inicioSegunRol(sesion.rol);

  return (
    <div className="pagina-error">
      <p className="pagina-error-codigo">404</p>
      <h2>Página no encontrada</h2>
      <p>La dirección que escribiste no existe.</p>
      <Link to={inicio}>Volver al inicio</Link>
    </div>
  );
}

export default NoEncontrado;