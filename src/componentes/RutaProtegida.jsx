import { useContext } from 'react';
import { Navigate } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import SinPermiso from '../paginas/SinPermiso';

function RutaProtegida(props) {
  const sesion = useContext(SesionContexto);

  if (sesion.token === null) {
    return <Navigate to="/login" replace />;
  }

  if (props.rolesPermitidos.includes(sesion.rol) === false) {
        return <SinPermiso/>;
  }

  return props.children;
}

export default RutaProtegida;