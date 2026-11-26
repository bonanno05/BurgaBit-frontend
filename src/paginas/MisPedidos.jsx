import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import TarjetaPedido from '../componentes/TarjetaPedido';
import hamburguesaCerca from '../assets/hamburguesa-cerca.webp';
import Cargando from '../componentes/Cargando';
import AvisoDemora from '../componentes/AvisoDemora';

function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
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

  useEffect(function () {
    async function cargarPedidos() {
      try {
        const datos = await pedirConSesion('/cliente', 'GET');
        setPedidos(datos);
      } catch (fallo) {
        setError(fallo.message);
      } finally {
        setCargando(false);
      }
    }

    cargarPedidos();
  }, [pedirConSesion]);

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

      const pedidosNuevos = pedidos.map(function (pedido) {
        if (pedido._id === id) {
          return pedidoActualizado;
        }
        return pedido;
      });
      setPedidos(pedidosNuevos);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setIdCancelando('');
    }
  }

  if (cargando) {
    return <Cargando texto="Cargando tus pedidos…" />;
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
              <button className="boton-peligro" onClick={function () { cancelarPedido(pedido._id); }} disabled={idCancelando === pedido._id}>
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