import { useState, useEffect } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import TarjetaPedido from '../componentes/TarjetaPedido';
import Cargando from '../componentes/Cargando';

// A qué estado pasa cada pedido con el botón de avanzar.
// Son las mismas transiciones que TRANSICIONES en cocineroControlador.js del backend (sin Cancelado).
const SIGUIENTE_ESTADO = {
  'Pendiente': 'En preparación',
  'En preparación': 'Lista para retirar',
  'Lista para retirar': 'Entregada',
};

function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [idCambiando, setIdCambiando] = useState('');
  const [actualizando, setActualizando] = useState(false);

  const pedirConSesion = usePedidoConSesion();

  // Trae los pedidos activos (Pendiente, En preparación y Lista para retirar), del más viejo al más nuevo.
  useEffect(function () {
    async function cargarPedidos() {
      try {
        const datos = await pedirConSesion('/cocinero', 'GET');
        setPedidos(datos);
      } catch (fallo) {
        setError(fallo.message);
      } finally {
        setCargando(false);
      }
    }

    cargarPedidos();
  }, [pedirConSesion]);

  // Botón "Actualizar": vuelve a pedir la lista para ver los pedidos nuevos.
  async function actualizar() {
    setError('');
    setActualizando(true);
    try {
      const datos = await pedirConSesion('/cocinero', 'GET');
      setPedidos(datos);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setActualizando(false);
    }
  }

  // Manda el cambio al backend y actualiza la lista sin volver a pedirla entera.
  async function cambiarEstado(id, cuerpo) {
    setError('');
    setIdCambiando(id);

    try {
      const actualizado = await pedirConSesion('/cocinero/' + id, 'PATCH', cuerpo);
      const nuevoEstado = actualizado.estado;

      if (nuevoEstado === 'Entregada' || nuevoEstado === 'Cancelado') {
        // Ya no está activo: sale de la lista de la cocina.
        const pedidosNuevos = pedidos.filter(function (pedido) {
          return pedido._id !== id;
        });
        setPedidos(pedidosNuevos);
      } else {
        // Sigue activo: se cambia solo el estado, para no perder los datos del cliente.
        const pedidosNuevos = pedidos.map(function (pedido) {
          if (pedido._id === id) {
            return { ...pedido, estado: nuevoEstado };
          }
          return pedido;
        });
        setPedidos(pedidosNuevos);
      }
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setIdCambiando('');
    }
  }

  function avanzar(pedido) {
    cambiarEstado(pedido._id, { estado: SIGUIENTE_ESTADO[pedido.estado] });
  }

  function cancelar(pedido) {
    const motivo = window.prompt('¿Por qué se cancela el pedido?');

    // null: el cocinero tocó "Cancelar" en la ventanita.
    if (motivo === null) {
      return;
    }
    if (motivo.trim() === '') {
      setError('Para cancelar un pedido tenés que escribir el motivo.');
      return;
    }

    cambiarEstado(pedido._id, { estado: 'Cancelado', motivoCancelacion: motivo.trim() });
  }

  if (cargando) {
    return <Cargando texto="Cargando los pedidos…" />;
  }

  return (
    <div className="cocina">
      <h2>Pedidos de cocina</h2>

      <button type="button" onClick={actualizar} disabled={actualizando}>
        {actualizando ? 'Actualizando…' : 'Actualizar'}
      </button>

      {error !== '' && <p className="error">{error}</p>}

      {pedidos.length === 0 && <p>No hay pedidos para preparar.</p>}

      {pedidos.map(function (pedido) {
        const ocupado = idCambiando === pedido._id;
        const sePuedeCancelar = pedido.estado === 'Pendiente' || pedido.estado === 'En preparación';

        return (
          <TarjetaPedido key={pedido._id} pedido={pedido}>
            {pedido.cliente !== null && (
              <p>
                Cliente: {pedido.cliente.nombre} {pedido.cliente.apellido}
              </p>
            )}

            <button type="button" onClick={function () { avanzar(pedido); }} disabled={ocupado}>
              Pasar a: {SIGUIENTE_ESTADO[pedido.estado]}
            </button>

            {sePuedeCancelar && (
              <button type="button" onClick={function () { cancelar(pedido); }} disabled={ocupado}>
                Cancelar pedido
              </button>
            )}
          </TarjetaPedido>
        );
      })}
    </div>
  );
}

export default Cocina;