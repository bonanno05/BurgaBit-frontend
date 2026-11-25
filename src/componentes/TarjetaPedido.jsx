// Muestra un pedido: fecha, estado, productos con sus ingredientes y total.
// Lo que se ponga entre <TarjetaPedido> y </TarjetaPedido> (botones) se dibuja al final.

import { formatearPrecio, formatearFecha } from '../utilidades/formato';
import DibujoHamburguesa from './DibujoHamburguesa';

// Clase de CSS para cada estado: cada una tiene su color (sección 23 de index.css).
// Las claves son los mismos textos que ESTADOS en Orden.js del backend.
const CLASE_POR_ESTADO = {
  'Pendiente': 'estado-pendiente',
  'En preparación': 'estado-preparacion',
  'Lista para retirar': 'estado-lista',
  'Entregada': 'estado-entregada',
  'Cancelado': 'estado-cancelado',
};

// Busca en el historial del pedido el motivo con el que se canceló.
// Devuelve '' si no hay historial o si no tiene motivo.
function motivoDeCancelacion(pedido) {
  if (pedido.historialEstados === undefined) {
    return '';
  }
  for (const cambio of pedido.historialEstados) {
    if (cambio.estado === 'Cancelado' && cambio.motivo) {
      return cambio.motivo;
    }
  }
  return '';
}

function TarjetaPedido(props) {
  const pedido = props.pedido;
  const motivo = motivoDeCancelacion(pedido);

  let claseEstado = 'estado';
  if (CLASE_POR_ESTADO[pedido.estado] !== undefined) {
    claseEstado = 'estado ' + CLASE_POR_ESTADO[pedido.estado];
  }

  return (
    <article className="tarjeta-pedido">
      <header>
        <span>{formatearFecha(pedido.createdAt)}</span>
        <span className={claseEstado}>{pedido.estado}</span>
      </header>

      {motivo !== '' && <p className="motivo-cancelacion">Motivo de la cancelación: {motivo}</p>}

      {pedido.productos.map(function (producto, posicion) {
        return (
          <div key={producto._id} className="producto producto-con-dibujo">
            {/* Cada ingrediente del pedido ya trae nombre y cantidad: es lo que pide el dibujo. */}
            <div className="producto-dibujo">
              <DibujoHamburguesa ingredientes={producto.ingredientes} chica={true} />
            </div>

            <div className="producto-detalle">
              <h4>Hamburguesa {posicion + 1}</h4>
              <ul>
                {producto.ingredientes.map(function (ingrediente) {
                  return (
                    <li key={ingrediente.ingrediente}>
                      {ingrediente.cantidad} x {ingrediente.nombre}
                    </li>
                  );
                })}
              </ul>
              <p>Subtotal: {formatearPrecio(producto.subtotal)}</p>
            </div>
          </div>
        );
      })}

      <p className="total">Total: {formatearPrecio(pedido.total)}</p>

      {props.children}
    </article>
  );
}

export default TarjetaPedido;