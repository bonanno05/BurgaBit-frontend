import { useContext } from 'react';
import { Navigate } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import PaginaError from '../paginas/PaginaError';

function RutaProtegida(props) {
  const sesion = useContext(SesionContexto);

  if (sesion.token === null) {
    return <Navigate to="/login" replace />;
  }

  if (props.rolesPermitidos.includes(sesion.rol) === false) {
    return <PaginaError codigo={403} />;
  }

  return props.children;
}

export default RutaProtegida;