import { useContext } from 'react';
import { Navigate } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import { inicioSegunRol } from '../contexto/inicioSegunRol';

function RutaProtegida(props) {
  const sesion = useContext(SesionContexto);

  if (sesion.token === null) {
    return <Navigate to="/login" replace />;
  }

  if (props.rolesPermitidos.includes(sesion.rol) === false) {
    return <Navigate to={inicioSegunRol(sesion.rol)} replace />;
  }

  return props.children;
}

export default RutaProtegida;