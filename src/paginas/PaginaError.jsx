import { useContext } from 'react';
import { Link } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import { inicioSegunRol } from '../contexto/inicioSegunRol';

// Los textos de cada error. Son los mismos códigos que usa el backend:
// 403: sabemos quién sos, pero no tenés permiso. 404: eso no existe.
const TEXTOS = {
  403: {
    titulo: 'No tenés permiso para entrar acá',
    explicacion: 'Esta sección no está disponible para tu cuenta.',
  },
  404: {
    titulo: 'Página no encontrada',
    explicacion: 'La dirección que escribiste no existe.',
  },
};

// Página de error: la usa RutaProtegida (403, cuando el rol no tiene permiso)
// y App (404, cuando la dirección no coincide con ninguna ruta).
// En el 403 la dirección no cambia: se queda en /admin, pero en vez de la pantalla del admin se ve esta.
// Props: codigo, 403 o 404.
function PaginaError(props) {
  const sesion = useContext(SesionContexto);
  const inicio = inicioSegunRol(sesion.rol);
  const textos = TEXTOS[props.codigo];

  return (
    <div className="pagina-error">
      <p className="pagina-error-codigo">{props.codigo}</p>
      <h2>{textos.titulo}</h2>
      <p>{textos.explicacion}</p>
      <Link to={inicio}>Volver al inicio</Link>
    </div>
  );
}

export default PaginaError;
