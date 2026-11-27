import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import { useCargarDatos } from '../contexto/useCargarDatos';
import { formatearPrecio } from '../utilidades/formato';
import SelectorIngrediente from '../componentes/SelectorIngrediente';
import ResumenPedido from '../componentes/ResumenPedido';
import DibujoHamburguesa from '../componentes/DibujoHamburguesa';
import { SesionContexto } from '../contexto/SesionContexto';
import { leerPedidoGuardado, guardarPedido, borrarPedidoGuardado } from '../utilidades/pedidoGuardado';
import Cargando from '../componentes/Cargando';
import ErrorConReintento from '../componentes/ErrorConReintento';
import AvisoDemora from '../componentes/AvisoDemora';

// La misma regla que MAX_POR_INGREDIENTE en clienteControlador.js del backend.
const MAXIMO_POR_INGREDIENTE = 3;

function ArmarHamburguesa() {
  // El menú: las categorías (los pasos) y los ingredientes disponibles. Los dos pedidos salen al mismo tiempo.
  const cargaCategorias = useCargarDatos('/categorias');
  const cargaIngredientes = useCargarDatos('/ingredientes/menu');
  const categorias = cargaCategorias.datos;
  const ingredientes = cargaIngredientes.datos;
  const [seleccion, setSeleccion] = useState({});
  const [pasoActual, setPasoActual] = useState(0);
  const sesion = useContext(SesionContexto);
  // Arranca con las hamburguesas que hayan quedado guardadas sin confirmar.
  // Se le pasa una función para que lea el localStorage solo la primera vez, no en cada dibujo.
  const [productos, setProductos] = useState(function () {
    return leerPedidoGuardado(sesion.idUsuario);
  });
  const pedirConSesion = usePedidoConSesion();
  const [enviando, setEnviando] = useState(false);
  const [errorPedido, setErrorPedido] = useState('');
  // true: se ve el armador paso a paso. false: se ve la pantalla de "hamburguesa agregada".
  const [armando, setArmando] = useState(true);
  const navegar = useNavigate();

  // Cada vez que cambian las hamburguesas agregadas (agregar o quitar), se guardan en el navegador.
  useEffect(function () {
    guardarPedido(sesion.idUsuario, productos);
  }, [sesion.idUsuario, productos]);

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

  // Lo que lleva la hamburguesa que se está armando: un item por ingrediente elegido.
  // Sirve para todo: el dibujo usa nombre y cantidad, el precio usa precio y cantidad,
  // y al agregarla al pedido se guarda tal cual.
  function itemsElegidos() {
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
    return items;
  }

  // Precio estimado de una lista de items. El que vale es el que calcula el backend al confirmar.
  function precioDe(items) {
    let total = 0;
    for (const item of items) {
      total = total + item.precio * item.cantidad;
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

    const items = itemsElegidos();

    // El id solo tiene que ser distinto de los otros productos del pedido (se usa como key y para quitarlo).
    // No se usa crypto.randomUUID() porque el navegador solo lo da en https o localhost:
    // fallaba al probar la app desde el celular con la IP de la compu.
    const nuevoProducto = {
      id: Date.now() + '-' + productos.length,
      items: items,
      subtotalEstimado: precioDe(items),
    };

    setProductos([...productos, nuevoProducto]);
    setSeleccion({});
    setPasoActual(0);
    setArmando(false);
  }

  // Botón "Armar otra hamburguesa" de la pantalla intermedia: vuelve al paso 1.
  function armarOtra() {
    setArmando(true);
    window.scrollTo(0, 0);
  }

  function quitarDelPedido(idProducto) {
    const productosNuevos = productos.filter(function (producto) {
      return producto.id !== idProducto;
    });
    setProductos(productosNuevos);
  }

  // Arma el JSON que pide el backend: solo el id y la cantidad de cada ingrediente.
  // El nombre y el precio son para mostrar; el backend los busca en la base de datos.
  function armarCuerpoDelPedido() {
    const productosParaEnviar = [];
    for (const producto of productos) {
      const ingredientesParaEnviar = [];
      for (const item of producto.items) {
        ingredientesParaEnviar.push({
          ingrediente: item.ingrediente,
          cantidad: item.cantidad,
        });
      }
      productosParaEnviar.push({ ingredientes: ingredientesParaEnviar });
    }
    return { productos: productosParaEnviar };
  }

  async function confirmarPedido() {
    if (productos.length === 0) {
      return;
    }

    setEnviando(true);
    setErrorPedido('');
    try {
      await pedirConSesion('/cliente', 'POST', armarCuerpoDelPedido());
      // El pedido ya está en el backend, lo guardado en el navegador se borra.
      borrarPedidoGuardado(sesion.idUsuario);
      navegar('/mis-pedidos', { state: { pedidoConfirmado: true } });
    } catch (fallo) {
      setErrorPedido(fallo.message);
      setEnviando(false);
    }
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

  if (cargaCategorias.cargando || cargaIngredientes.cargando) {
    return <Cargando texto="Cargando el menú…" />;
  }

  if (cargaCategorias.error !== '') {
    return <ErrorConReintento mensaje={cargaCategorias.error} />;
  }
  if (cargaIngredientes.error !== '') {
    return <ErrorConReintento mensaje={cargaIngredientes.error} />;
  }

  if (categorias.length === 0) {
    return <p>Todavía no hay pasos cargados en el menú.</p>;
  }

  // El error y el botón de confirmar se usan en las dos vistas: se guardan en una variable (el JSX es un valor).
  const botonConfirmar = (
    <>
      {errorPedido !== '' && <p className="error">{errorPedido}</p>}
      <button type="button" onClick={confirmarPedido} disabled={enviando}>
        {enviando ? 'Enviando pedido…' : 'Confirmar pedido'}
      </button>
      {enviando && <AvisoDemora />}
    </>
  );

  // Pantalla intermedia: después de agregar una hamburguesa.
  // Si se quitan todas, productos queda vacío y se vuelve solo al armador.
  if (armando === false && productos.length > 0) {
    return (
      <div className="armar">
        <p className="exito">✅ ¡Hamburguesa agregada a tu pedido!</p>
        <p>Podés confirmar el pedido o armar otra hamburguesa para sumarla.</p>

        <ResumenPedido productos={productos} alQuitar={quitarDelPedido}>
          {botonConfirmar}
        </ResumenPedido>

        <button type="button" className="boton-secundario" onClick={armarOtra} disabled={enviando}>
          Armar otra hamburguesa
        </button>
      </div>
    );
  }

  const categoria = categorias[pasoActual];
  const opciones = ingredientesDe(categoria);
  const elegidos = cantidadEnCategoria(categoria);
  const cumpleMinimo = elegidos >= categoria.minimo;
  const esElPrimero = pasoActual === 0;
  const esElUltimo = pasoActual === categorias.length - 1;
  const elegidosAhora = itemsElegidos();

  return (
    <div className="armar">
      <div className="banner">
        <h2>Armá tu hamburguesa</h2>
        <p>Elegí cada ingrediente, paso a paso.</p>
      </div>

      {/* En compu: menú a la izquierda y recuadro de la hamburguesa a la derecha.
      En celular: una sola columna y el recuadro pegado abajo. */}
      <div className="armar-columnas">
        <div className="armar-menu">
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
          </div>

          <p className="nota">Los precios son estimados: el final lo calcula el sistema al confirmar el pedido.</p>
        </div>

        <aside className="armar-resumen">
          <DibujoHamburguesa ingredientes={elegidosAhora} />

          <div className="armar-resumen-texto">
            <h3>Tu hamburguesa</h3>
            <p className="total">{formatearPrecio(precioDe(elegidosAhora))}</p>
          </div>

          <button
            type="button"
            className="boton-dorado"
            onClick={agregarAlPedido}
            disabled={hamburguesaCompleta() === false}
          >
            Agregar al pedido
          </button>
        </aside>
      </div>

      <ResumenPedido productos={productos} alQuitar={quitarDelPedido}>
        {botonConfirmar}
      </ResumenPedido>
    </div>
  );
}

export default ArmarHamburguesa;