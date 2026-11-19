import { useContext, useCallback } from 'react';
import { SesionContexto } from './SesionContexto';
import { pedirAlBackend } from '../servicios/api';

// Hook propio: devuelve una función para pedir al backend con el token de la sesión.
// Si el backend dice que la sesión ya no sirve, la cierra (y el router manda al login).
export function usePedidoConSesion() {
  const sesion = useContext(SesionContexto);
  const token = sesion.token;
  const cerrarSesion = sesion.cerrarSesion;

  const pedirConSesion = useCallback(async function (ruta, metodo, cuerpo) {
    try {
      const datos = await pedirAlBackend(ruta, metodo, cuerpo, token);
      return datos;
    } catch (fallo) {
      const tokenInvalido = fallo.status === 401;
      const cuentaDesactivada = fallo.status === 403 && fallo.message === 'Usuario desactivado.';

      if (tokenInvalido || cuentaDesactivada) {
        cerrarSesion();
      }

      throw fallo;
    }
  }, [token, cerrarSesion]);

  return pedirConSesion;
}