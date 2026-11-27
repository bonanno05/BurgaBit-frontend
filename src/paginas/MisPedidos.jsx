import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import { useCargarDatos } from '../contexto/useCargarDatos';
import TarjetaPedido from '../componentes/TarjetaPedido';
import hamburguesaCerca from '../assets/hamburguesa-cerca.webp';
import Cargando from '../componentes/Cargando';
import ErrorConReintento from '../componentes/ErrorConReintento';
import AvisoDemora from '../componentes/AvisoDemora';

function MisPedidos() {
  const carga = useCargarDatos('/cliente');
  const pedidos = carga.datos;
  const [error, setError] = useState('');
  const [idCancelando, setIdCancelando] = useState('');

  // Si se llegó desde "Confirmar pedido", la navegación trae { pedidoConfirmado: true }.
  const ubicacion = useLocation();
  let vieneDeConfirmar = false;
  if (ubicacion.state !== null && ubicacion.state.pedidoConfirmado === true) {
    vieneDeConfirmar = true;
  }
  const [avisoConfirmado, setAvisoConfirmado] = useState(vieneDeConfirmar);

  const pedirConSesion = usePedidoConSesion();
  const navegar = useNavigate();

  // El aviso ya quedó guardado en avisoConfirmado: se borra el state de la dirección.
  // Si no, el navegador lo recuerda y el aviso vuelve a salir cada vez que se recarga la página.
  useEffect(function () {
    if (vieneDeConfirmar) {
      navegar('/mis-pedidos', { replace: true });
    }
  }, [vieneDeConfirmar, navegar]);

  async function cancelarPedido(id) {
    const confirmado = window.confirm('¿Seguro que querés cancelar este pedido?');
    if (confirmado === false) {
      return;
    }

    setError('');
    setAvisoConfirmado(false);
    setIdCancelando(id);

    try {
      const pedidoActualizado = await pedirConSesion('/cliente/' + id + '/cancelar', 'PATCH');

      // Se le pasa una función: React le da la lista más nueva (por si cambió mientras se esperaba).
      carga.setDatos(function (anteriores) {
        return anteriores.map(function (pedido) {
          if (pedido._id === id) {
            return pedidoActualizado;
          }
          return pedido;
        });
      });
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setIdCancelando('');
    }
  }

  if (carga.cargando) {
    return <Cargando texto="Cargando tus pedidos…" />;
  }

  // Si no se pudo traer la lista, se muestra el error solo (y no "Todavía no hiciste ningún pedido").
  if (carga.error !== '') {
    return <ErrorConReintento mensaje={carga.error} />;
  }

  return (
    <div className="mis-pedidos">
      <h2>Mis pedidos</h2>
      {avisoConfirmado && (
        <p className="exito">
          ✅ ¡Pedido confirmado! Lo vas a ver acá abajo como Pendiente. Recargá la página para ver cuando la cocina lo empiece a preparar.
        </p>
      )}
      {error !== '' && <p className="error">{error}</p>}

      {pedidos.length === 0 && (
        <div className="sin-pedidos">
          <img src={hamburguesaCerca} alt="" />
          <p>Todavía no hiciste ningún pedido.</p>
          <Link to="/armar">Armar mi primera hamburguesa</Link>
        </div>
      )}

      {pedidos.map(function (pedido) {
        return (
          <TarjetaPedido key={pedido._id} pedido={pedido}>
            {pedido.estado === 'Pendiente' && (
              <button
                type="button"
                className="boton-peligro"
                onClick={function () { cancelarPedido(pedido._id); }}
                disabled={idCancelando === pedido._id}
              >
                {idCancelando === pedido._id ? 'Cancelando…' : 'Cancelar pedido'}
              </button>
            )}

            {idCancelando === pedido._id && <AvisoDemora />}
          </TarjetaPedido>
        );
      })}
    </div>
  );
}

export default MisPedidos;
