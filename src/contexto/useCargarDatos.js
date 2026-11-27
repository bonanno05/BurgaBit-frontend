import { useState, useEffect, useCallback } from 'react';
import { usePedidoConSesion } from './usePedidoConSesion';

// Hook propio: pide una lista al backend al abrir la página y devuelve todo lo que la página
// necesita para mostrarla. Antes, cada página repetía estos tres estados y el useEffect.
// Se usa así:
//   const carga = useCargarDatos('/cliente');
//   carga.datos      la lista que llegó (arranca vacía)
//   carga.setDatos   para cambiar la lista sin volver a pedirla
//   carga.cargando   true hasta que llega la primera respuesta
//   carga.error      el mensaje si el pedido falló ('' si salió bien)
//   carga.recargar   vuelve a pedir la lista (por ejemplo, después de crear algo)
export function useCargarDatos(ruta) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const pedirConSesion = usePedidoConSesion();

  // useCallback: la misma función entre dibujos, así el useEffect de abajo no se repite sin parar.
  const recargar = useCallback(async function () {
    try {
      const respuesta = await pedirConSesion(ruta, 'GET');
      setDatos(respuesta);
      setError('');
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }, [pedirConSesion, ruta]);

  // Al abrir la página se pide la lista por primera vez.
  // Va dentro de una función async, como en las páginas: los estados cambian recién
  // cuando llega la respuesta, no apenas se dibuja la página.
  useEffect(function () {
    async function cargarPorPrimeraVez() {
      await recargar();
    }
    cargarPorPrimeraVez();
  }, [recargar]);

  return {
    datos: datos,
    setDatos: setDatos,
    cargando: cargando,
    error: error,
    recargar: recargar,
  };
}
