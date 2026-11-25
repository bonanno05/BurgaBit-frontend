// Muestra un pedido: fecha, estado, productos con sus ingredientes y total.
// Lo que se ponga entre <TarjetaPedido> y </TarjetaPedido> (botones) se dibuja al final.

import { formatearPrecio, formatearFecha } from '../utilidades/formato';
import DibujoHamburguesa from './DibujoHamburguesa';

function TarjetaPedido(props) {
  const pedido = props.pedido;

  return (
    <article className="tarjeta-pedido">
      <header>
        <span>{formatearFecha(pedido.createdAt)}</span>
        <span className="estado">{pedido.estado}</span>
      </header>

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