import { useState } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import TarjetaPedido from '../componentes/TarjetaPedido';
import HistorialEstados from '../componentes/HistorialEstados';
import { normalizarTexto, personaCoincide } from '../utilidades/busqueda';
import AvisoDemora from '../componentes/AvisoDemora';

// Los mismos estados que ESTADOS en el modelo Orden.js del backend.
const ESTADOS = ['Pendiente', 'En preparación', 'Lista para retirar', 'Entregada', 'Cancelado'];

// Opciones del desplegable de período.
const PERIODOS = [
  { valor: 'hoy', texto: 'Hoy' },
  { valor: 'semana', texto: 'Últimos 7 días' },
  { valor: 'todos', texto: 'Todos' },
];

// Devuelve desde qué momento se muestran los pedidos según el período elegido,
// o null si se muestran todos. "Hoy" arranca a las 00:00 de hoy (hora de la compu);
// "Últimos 7 días" arranca a las 00:00 de hace 6 días (hoy + los 6 anteriores).
function inicioDelPeriodo(periodo) {
  if (periodo === 'todos') {
    return null;
  }
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  if (periodo === 'semana') {
    inicio.setDate(inicio.getDate() - 6);
  }
  return inicio;
}

// true si el pedido se hizo desde "inicio" en adelante (null = cualquier fecha).
function pedidoEnPeriodo(pedido, inicio) {
  if (inicio === null) {
    return true;
  }
  return new Date(pedido.createdAt) >= inicio;
}

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [idAbierto, setIdAbierto] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  // Lo que se escribe en el buscador de cliente (filtra los pedidos que ya llegaron).
  const [busqueda, setBusqueda] = useState('');
  // El período elegido arranca en "Hoy", porque un local trabaja por día.
  const [periodo, setPeriodo] = useState('hoy');
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

  function cambiarBusqueda(evento) {
    setBusqueda(evento.target.value);
  }

  function cambiarPeriodo(evento) {
    setPeriodo(evento.target.value);
  }

  // Los pedidos que se ven: los que coinciden con el cliente buscado Y están en el período.
  // Lo buscado y el inicio del período se calculan una sola vez, no una vez por pedido.
  const textoBuscado = normalizarTexto(busqueda);
  const inicio = inicioDelPeriodo(periodo);
  const pedidosVisibles = pedidos.filter(function (pedido) {
    return personaCoincide(pedido.cliente, textoBuscado) && pedidoEnPeriodo(pedido, inicio);
  });

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
      {cargando && <AvisoDemora />}
      {error !== '' && <p className="error">{error}</p>}

      {buscado === false && cargando === false && (
        <p className="nota">Elegí un estado y tocá "Buscar" para ver los pedidos.</p>
      )}

      {buscado && pedidos.length === 0 && <p>No hay pedidos para mostrar.</p>}

      {/* El buscador aparece cuando ya hay pedidos, filtra los que trajo "Buscar". */}
      {pedidos.length > 0 && (
        <>
          <div className="filtro buscador">

            <label>
              Período
              <select value={periodo} onChange={cambiarPeriodo}>
                {PERIODOS.map(function (opcion) {
                  return (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Cliente
              <input
                type="search"
                value={busqueda}
                onChange={cambiarBusqueda}
                placeholder="Nombre, apellido o email"
              />
            </label>
          </div>

          <p className="nota">
            Mostrando {pedidosVisibles.length} de {pedidos.length} pedidos.
          </p>

          {pedidosVisibles.length === 0 && <p>Ningún pedido coincide con los filtros.</p>}
        </>
      )}

      {pedidosVisibles.map(function (pedido) {
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