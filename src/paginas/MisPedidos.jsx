import { useState, useEffect } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import TarjetaPedido from '../componentes/TarjetaPedido';

function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [idCancelando, setIdCancelando] = useState('');

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
    return <p>Cargando tus pedidos…</p>;
  }

  return (
    <div className="mis-pedidos">
      <h2>Mis pedidos</h2>

      {error !== '' && <p className="error">{error}</p>}

      {pedidos.length === 0 && <p>Todavía no hiciste ningún pedido.</p>}

      {pedidos.map(function (pedido) {
        return (
          <TarjetaPedido key={pedido._id} pedido={pedido}>
            {pedido.estado === 'Pendiente' && (
              <button
                onClick={function () { cancelarPedido(pedido._id); }}
                disabled={idCancelando === pedido._id}
              >
                {idCancelando === pedido._id ? 'Cancelando…' : 'Cancelar pedido'}
              </button>
            )}
          </TarjetaPedido>
        );
      })}
    </div>
  );
}

export default MisPedidos;