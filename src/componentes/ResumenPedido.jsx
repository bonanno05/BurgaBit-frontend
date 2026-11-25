import { formatearPrecio } from '../utilidades/formato';
import DibujoHamburguesa from './DibujoHamburguesa';

// Lista de hamburguesas ya armadas, con su precio estimado y el total.
// No guarda estado: los productos los maneja la página y llegan por props.
function ResumenPedido(props) {
  if (props.productos.length === 0) {
    return null;
  }

  let total = 0;
  for (const producto of props.productos) {
    total = total + producto.subtotalEstimado;
  }

  return (
    <aside className="resumen-pedido">
      <h3>Tu pedido</h3>

      {props.productos.map(function (producto, posicion) {
        return (
          <div key={producto.id} className="producto producto-con-dibujo">
            {/* Los items también traen nombre y cantidad, así que sirven tal cual para el dibujo. */}
            <div className="producto-dibujo">
              <DibujoHamburguesa ingredientes={producto.items} chica={true} />
            </div>

            <div className="producto-detalle">
              <h4>Hamburguesa {posicion + 1}</h4>
              <ul>
                {producto.items.map(function (item) {
                  return (
                    <li key={item.ingrediente}>
                      {item.cantidad} x {item.nombre}
                    </li>
                  );
                })}
              </ul>
              <p>{formatearPrecio(producto.subtotalEstimado)}</p>
              <button type="button" onClick={function () { props.alQuitar(producto.id); }}>
                Quitar
              </button>
            </div>
          </div>
        );
      })}

      <p className="total">Total estimado: {formatearPrecio(total)}</p>

      {props.children}
    </aside>
  );
}

export default ResumenPedido;