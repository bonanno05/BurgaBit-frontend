import { useState } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import TarjetaPedido from '../componentes/TarjetaPedido';
import HistorialEstados from '../componentes/HistorialEstados';

// Los mismos estados que ESTADOS en el modelo Orden.js del backend.
const ESTADOS = ['Pendiente', 'En preparación', 'Lista para retirar', 'Entregada', 'Cancelado'];

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [idAbierto, setIdAbierto] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const pedirConSesion = usePedidoConSesion();

  // Los pedidos se piden recién cuando el admin toca "Buscar" (no al abrir la pantalla).
  async function buscar() {
    let ruta = '/admin';
    if (filtro !== '') {
      ruta = '/admin?estado=' + encodeURIComponent(filtro);
    }

    setError('');
    setIdAbierto('');
    setDetalle(null);
    setCargando(true);

    try {
      const datos = await pedirConSesion(ruta, 'GET');
      setPedidos(datos);
      setBuscado(true);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }

  // Al cambiar el estado elegido se borra el resultado anterior, para que no quede una lista que no corresponde.
  function cambiarFiltro(evento) {
    setFiltro(evento.target.value);
    setPedidos([]);
    setBuscado(false);
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

      <div className="filtro">
        <label>
          Estado
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

        <button type="button" onClick={buscar} disabled={cargando}>
          {cargando ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {error !== '' && <p className="error">{error}</p>}

      {buscado === false && cargando === false && (
        <p className="nota">Elegí un estado y tocá "Buscar" para ver los pedidos.</p>
      )}

      {buscado && pedidos.length === 0 && <p>No hay pedidos para mostrar.</p>}

      {pedidos.map(function (pedido) {
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