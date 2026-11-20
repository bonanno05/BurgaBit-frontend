import { useState, useEffect } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import TarjetaPedido from '../componentes/TarjetaPedido';
import HistorialEstados from '../componentes/HistorialEstados';

// Los mismos estados que ESTADOS en el modelo Orden.js del backend.
const ESTADOS = ['Pendiente', 'En preparación', 'Lista para retirar', 'Entregada', 'Cancelado'];

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [idAbierto, setIdAbierto] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const pedirConSesion = usePedidoConSesion();

  // Trae los pedidos cada vez que cambia el filtro (todos, o solo los de un estado).
  useEffect(function () {
    // Si el filtro cambia antes de que llegue la respuesta, esa respuesta vieja se ignora.
    let respuestaVieja = false;

    async function cargarPedidos() {
      let ruta = '/admin';
      if (filtro !== '') {
        ruta = '/admin?estado=' + encodeURIComponent(filtro);
      }

      try {
        const datos = await pedirConSesion(ruta, 'GET');
        if (respuestaVieja === false) {
          setPedidos(datos);
        }
      } catch (fallo) {
        if (respuestaVieja === false) {
          setError(fallo.message);
        }
      } finally {
        if (respuestaVieja === false) {
          setCargando(false);
        }
      }
    }

    cargarPedidos();

    // Limpieza: React la ejecuta antes de volver a correr el efecto (cuando cambia el filtro).
    return function () {
      respuestaVieja = true;
    };
  }, [pedirConSesion, filtro]);

  function cambiarFiltro(evento) {
    setFiltro(evento.target.value);
    setCargando(true);
    setError('');
    setIdAbierto('');
    setDetalle(null);
  }

  // Abre o cierra el historial de un pedido. Solo uno abierto por vez.
  async function verHistorial(id) {
    if (idAbierto === id) {
      setIdAbierto('');
      setDetalle(null);
      return;
    }

    setError('');
    setIdAbierto(id);
    setDetalle(null);
    setCargandoDetalle(true);

    try {
      const datos = await pedirConSesion('/admin/' + id, 'GET');
      setDetalle(datos);
    } catch (fallo) {
      setError(fallo.message);
      setIdAbierto('');
    } finally {
      setCargandoDetalle(false);
    }
  }

  return (
    <div className="admin-pedidos">
      <h2>Pedidos</h2>

      <label>
        Estado:{' '}
        <select value={filtro} onChange={cambiarFiltro}>
          <option value="">Todos</option>
          {ESTADOS.map(function (estado) {
            return (
              <option key={estado} value={estado}>
                {estado}
              </option>
            );
          })}
        </select>
      </label>

      {error !== '' && <p className="error">{error}</p>}

      {cargando && <p>Cargando los pedidos…</p>}

      {cargando === false && pedidos.length === 0 && <p>No hay pedidos para mostrar.</p>}

      {cargando === false && pedidos.map(function (pedido) {
        const abierto = idAbierto === pedido._id;

        return (
          <TarjetaPedido key={pedido._id} pedido={pedido}>
            {pedido.cliente !== null && (
              <p>
                Cliente: {pedido.cliente.nombre} {pedido.cliente.apellido} ({pedido.cliente.email})
              </p>
            )}

            <button type="button" onClick={function () { verHistorial(pedido._id); }}>
              {abierto ? 'Ocultar historial' : 'Ver historial'}
            </button>

            {abierto && cargandoDetalle && <p>Cargando el historial…</p>}

            {abierto && detalle !== null && <HistorialEstados historial={detalle.historialEstados} />}
          </TarjetaPedido>
        );
      })}
    </div>
  );
}

export default AdminPedidos;