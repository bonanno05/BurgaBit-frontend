import { formatearPrecio } from '../utilidades/formato';

// Una fila del armador: nombre, precio y botones para elegir la cantidad.
// No guarda estado propio: la cantidad la maneja la página y llega por props.
function SelectorIngrediente(props) {
  const ingrediente = props.ingrediente;

  return (
    <li className="selector-ingrediente">
      <span className="nombre">{ingrediente.nombre}</span>
      <span className="precio">{formatearPrecio(ingrediente.precio)}</span>

      <div className="cantidad">
        <button
          type="button"
          onClick={props.alRestar}
          disabled={props.cantidad === 0}
          aria-label={'Quitar ' + ingrediente.nombre}
        >
          −
        </button>

        <span>{props.cantidad}</span>

        <button
          type="button"
          onClick={props.alSumar}
          disabled={props.puedeSumar === false}
          aria-label={'Agregar ' + ingrediente.nombre}
        >
          +
        </button>
      </div>
    </li>
  );
}

export default SelectorIngrediente;