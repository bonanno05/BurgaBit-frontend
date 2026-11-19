import { useState, useEffect } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import { formatearPrecio } from '../utilidades/formato';
import SelectorIngrediente from '../componentes/SelectorIngrediente';
import ResumenPedido from '../componentes/ResumenPedido';

// La misma regla que MAX_POR_INGREDIENTE en clienteControlador.js del backend.
const MAXIMO_POR_INGREDIENTE = 3;

function ArmarHamburguesa() {
  const [categorias, setCategorias] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccion, setSeleccion] = useState({});
  const [pasoActual, setPasoActual] = useState(0);
  const [productos, setProductos] = useState([]);
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

    // Cuántas unidades de un ingrediente ya están en las hamburguesas agregadas al pedido.
  function cantidadEnPedido(idIngrediente) {
    let suma = 0;
    for (const producto of productos) {
      for (const item of producto.items) {
        if (item.ingrediente === idIngrediente) {
          suma = suma + item.cantidad;
        }
      }
    }
    return suma;
  }

  // Se puede sumar uno más si no pasa el máximo por ingrediente, el stock ni el máximo de la categoría.
  // El stock se comparte entre todas las hamburguesas del pedido.
  function puedeSumar(ingrediente) {
    const cantidad = cantidadElegida(ingrediente._id);

    if (cantidad >= MAXIMO_POR_INGREDIENTE) {
      return false;
    }
    if (cantidad + cantidadEnPedido(ingrediente._id) >= ingrediente.cantidad) {
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

    // La hamburguesa está completa si tiene al menos un ingrediente y cumple el mínimo de todas las categorías.
  function hamburguesaCompleta() {
    if (Object.keys(seleccion).length === 0) {
      return false;
    }
    for (const categoria of categorias) {
      if (cantidadEnCategoria(categoria) < categoria.minimo) {
        return false;
      }
    }
    return true;
  }

  function agregarAlPedido() {
    if (hamburguesaCompleta() === false) {
      return;
    }

    const items = [];
    for (const ingrediente of ingredientes) {
      const cantidad = cantidadElegida(ingrediente._id);
      if (cantidad > 0) {
        items.push({
          ingrediente: ingrediente._id,
          nombre: ingrediente.nombre,
          precio: ingrediente.precio,
          cantidad: cantidad,
        });
      }
    }

    const nuevoProducto = {
      id: crypto.randomUUID(),
      items: items,
      subtotalEstimado: precioEstimado(),
    };

    setProductos([...productos, nuevoProducto]);
    setSeleccion({});
    setPasoActual(0);
  }

  function quitarDelPedido(idProducto) {
    const productosNuevos = productos.filter(function (producto) {
      return producto.id !== idProducto;
    });
    setProductos(productosNuevos);
  }

  function irAlAnterior() {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  }

  function irAlSiguiente() {
    const esElUltimo = pasoActual === categorias.length - 1;
    if (esElUltimo === false) {
      setPasoActual(pasoActual + 1);
    }
  }

  if (cargando) {
    return <p>Cargando el menú…</p>;
  }

  if (error !== '') {
    return <p className="error">{error}</p>;
  }

    if (categorias.length === 0) {
    return <p>Todavía no hay pasos cargados en el menú.</p>;
  }

  const categoria = categorias[pasoActual];
  const opciones = ingredientesDe(categoria);
  const elegidos = cantidadEnCategoria(categoria);
  const cumpleMinimo = elegidos >= categoria.minimo;
  const esElPrimero = pasoActual === 0;
  const esElUltimo = pasoActual === categorias.length - 1;

  return (
    <div className="armar">
      <h2>Armá tu hamburguesa</h2>

      <p className="progreso">
        Paso {pasoActual + 1} de {categorias.length}
      </p>

      <section className="paso">
        <h3>{categoria.nombre}</h3>
        <p>
          Elegí entre {categoria.minimo} y {categoria.maximo}. Llevás {elegidos}.
        </p>

        {cumpleMinimo === false && (
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

      <div className="navegacion-pasos">
        <button type="button" onClick={irAlAnterior} disabled={esElPrimero}>
          Anterior
        </button>

        {esElUltimo === false && (
          <button type="button" onClick={irAlSiguiente} disabled={cumpleMinimo === false}>
            Siguiente
          </button>
        )}

        {esElUltimo && (
          <button type="button" onClick={agregarAlPedido} disabled={hamburguesaCompleta() === false}>
            Agregar al pedido
          </button>
        )}
      </div>

      <p className="total">Esta hamburguesa: {formatearPrecio(precioEstimado())}</p>
      <p className="nota">Los precios son estimados: el final lo calcula el sistema al confirmar el pedido.</p>

      <ResumenPedido productos={productos} alQuitar={quitarDelPedido} />
    </div>
  );
}

export default ArmarHamburguesa;