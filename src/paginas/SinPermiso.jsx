import { useContext } from 'react';
import { Link } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import { inicioSegunRol } from '../contexto/inicioSegunRol';

// Se muestra cuando alguien con sesión entra a una ruta que no es de su rol
// La dirección no cambia: se queda en /admin, pero en vez de la pantalla del admin se ve esta.
function SinPermiso() {
  const sesion = useContext(SesionContexto);
  const inicio = inicioSegunRol(sesion.rol);

  return (
    <div className="pagina-error">
      <p className="pagina-error-codigo">403</p>
      <h2>No tenés permiso para entrar acá</h2>
      <p>Esta sección no está disponible para tu cuenta.</p>
      <Link to={inicio}>Volver al inicio</Link>
    </div>
  );
}

export default SinPermiso;