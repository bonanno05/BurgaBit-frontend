import { useState, useEffect } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import { formatearPrecio } from '../utilidades/formato';
import SelectorIngrediente from '../componentes/SelectorIngrediente';

// La misma regla que MAX_POR_INGREDIENTE en clienteControlador.js del backend.
const MAXIMO_POR_INGREDIENTE = 3;

function ArmarHamburguesa() {
  const [categorias, setCategorias] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccion, setSeleccion] = useState({});

  const pedirConSesion = usePedidoConSesion();

  useEffect(function () {
    async function cargarMenu() {
      try {
        const respuestas = await Promise.all([
          pedirConSesion('/categorias', 'GET'),
          pedirConSesion('/ingredientes/menu', 'GET'),
        ]);
        setCategorias(respuestas[0]);
        setIngredientes(respuestas[1]);
      } catch (fallo) {
        setError(fallo.message);
      } finally {
        setCargando(false);
      }
    }

    cargarMenu();
  }, [pedirConSesion]);

  // Devuelve los ingredientes del menú que pertenecen a una categoría.
  function ingredientesDe(categoria) {
    return ingredientes.filter(function (ingrediente) {
      return ingrediente.categoria._id === categoria._id;
    });
  }

  // Cuántas unidades de un ingrediente lleva la hamburguesa (0 si no lo eligió).
  function cantidadElegida(idIngrediente) {
    const cantidad = seleccion[idIngrediente];
    if (cantidad === undefined) {
      return 0;
    }
    return cantidad;
  }

  // Cuántas unidades lleva en total de una categoría (para el mínimo y el máximo).
  function cantidadEnCategoria(categoria) {
    let suma = 0;
    const opciones = ingredientesDe(categoria);
    for (const ingrediente of opciones) {
      suma = suma + cantidadElegida(ingrediente._id);
    }
    return suma;
  }

  // Se puede sumar uno más si no pasa el máximo por ingrediente, el stock ni el máximo de la categoría.
  function puedeSumar(ingrediente) {
    const cantidad = cantidadElegida(ingrediente._id);

    if (cantidad >= MAXIMO_POR_INGREDIENTE) {
      return false;
    }
    if (cantidad >= ingrediente.cantidad) {
      return false;
    }
    if (cantidadEnCategoria(ingrediente.categoria) >= ingrediente.categoria.maximo) {
      return false;
    }
    return true;
  }

  function sumar(ingrediente) {
    if (puedeSumar(ingrediente) === false) {
      return;
    }
    const nuevaSeleccion = { ...seleccion };
    nuevaSeleccion[ingrediente._id] = cantidadElegida(ingrediente._id) + 1;
    setSeleccion(nuevaSeleccion);
  }

  function restar(ingrediente) {
    const cantidad = cantidadElegida(ingrediente._id);
    if (cantidad === 0) {
      return;
    }
    const nuevaSeleccion = { ...seleccion };
    if (cantidad === 1) {
      delete nuevaSeleccion[ingrediente._id];
    } else {
      nuevaSeleccion[ingrediente._id] = cantidad - 1;
    }
    setSeleccion(nuevaSeleccion);
  }

  // Precio estimado de la hamburguesa. El que vale es el que calcula el backend al confirmar.
  function precioEstimado() {
    let total = 0;
    for (const ingrediente of ingredientes) {
      total = total + ingrediente.precio * cantidadElegida(ingrediente._id);
    }
    return total;
  }

  if (cargando) {
    return <p>Cargando el menú…</p>;
  }

  if (error !== '') {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="armar">
      <h2>Armá tu hamburguesa</h2>

      {categorias.map(function (categoria) {
        const opciones = ingredientesDe(categoria);
        const elegidos = cantidadEnCategoria(categoria);

        return (
          <section key={categoria._id} className="paso">
            <h3>
              Paso {categoria.paso}: {categoria.nombre}
            </h3>
            <p>
              Elegí entre {categoria.minimo} y {categoria.maximo}. Llevás {elegidos}.
            </p>

            {elegidos < categoria.minimo && (
              <p className="aviso">Te falta elegir al menos {categoria.minimo - elegidos}.</p>
            )}

            {opciones.length === 0 && <p>No hay ingredientes disponibles en este paso.</p>}

            <ul>
              {opciones.map(function (ingrediente) {
                return (
                  <SelectorIngrediente
                    key={ingrediente._id}
                    ingrediente={ingrediente}
                    cantidad={cantidadElegida(ingrediente._id)}
                    puedeSumar={puedeSumar(ingrediente)}
                    alSumar={function () { sumar(ingrediente); }}
                    alRestar={function () { restar(ingrediente); }}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="total">Precio estimado: {formatearPrecio(precioEstimado())}</p>
      <p className="nota">El precio final lo calcula el sistema al confirmar el pedido.</p>
    </div>
  );
}

export default ArmarHamburguesa;