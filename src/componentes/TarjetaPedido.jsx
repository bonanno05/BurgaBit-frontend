// Muestra un pedido: fecha, estado, productos con sus ingredientes y total.
// Lo que se ponga entre <TarjetaPedido> y </TarjetaPedido> (botones) se dibuja al final.

import { formatearPrecio, formatearFecha } from '../utilidades/formato';

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
          <div key={producto._id} className="producto">
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
        );
      })}

      <p className="total">Total: {formatearPrecio(pedido.total)}</p>

      {props.children}
    </article>
  );
}

export default TarjetaPedido;