import { useState, useEffect } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import { formatearPrecio } from '../utilidades/formato';
import FormularioIngrediente from '../componentes/FormularioIngrediente';
import Cargando from '../componentes/Cargando';

function AdminIngredientes() {
  const [ingredientes, setIngredientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [idEditando, setIdEditando] = useState('');
  const [idCambiando, setIdCambiando] = useState('');

  const pedirConSesion = usePedidoConSesion();

  // Trae todos los ingredientes (también los no disponibles) y las categorías, al mismo tiempo.
  useEffect(function () {
    async function cargarDatos() {
      try {
        const respuestas = await Promise.all([
          pedirConSesion('/ingredientes', 'GET'),
          pedirConSesion('/categorias', 'GET'),
        ]);
        setIngredientes(respuestas[0]);
        setCategorias(respuestas[1]);
      } catch (fallo) {
        setError(fallo.message);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [pedirConSesion]);

  // Después de cada cambio se vuelve a pedir la lista: así el stock es el real (los pedidos también lo descuentan).
  async function recargarIngredientes() {
    try {
      const datos = await pedirConSesion('/ingredientes', 'GET');
      setIngredientes(datos);
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  function ingredienteGuardado(mensaje) {
    setError('');
    setAviso(mensaje);
    setIdEditando('');
    recargarIngredientes();
  }

  function empezarEdicion(id) {
    setAviso('');
    setIdEditando(id);
  }

  function cancelarEdicion() {
    setIdEditando('');
  }

  // Manda un cambio de una fila (reponer, dar de baja o reactivar) y recarga la lista.
  async function cambiarIngrediente(id, ruta, metodo, cuerpo) {
    setError('');
    setAviso('');
    setIdCambiando(id);

    try {
      const datos = await pedirConSesion(ruta, metodo, cuerpo);
      setAviso(datos.msg);
      await recargarIngredientes();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setIdCambiando('');
    }
  }

  function reponer(ingrediente) {
    const texto = window.prompt('¿Cuántas unidades de ' + ingrediente.nombre + ' sumás al stock?');

    // null: tocó "Cancelar" en la ventanita.
    if (texto === null) {
      return;
    }
    const unidades = Number(texto);
    if (Number.isInteger(unidades) === false || unidades <= 0) {
      setError('Para reponer, escribí un número entero mayor que 0.');
      return;
    }

    cambiarIngrediente(ingrediente._id, '/ingredientes/' + ingrediente._id + '/stock', 'PATCH', { cantidad: unidades });
  }

  function darDeBaja(ingrediente) {
    const confirmado = window.confirm('¿Dar de baja ' + ingrediente.nombre + '? Deja de aparecer en el menú.');
    if (confirmado === false) {
      return;
    }
    cambiarIngrediente(ingrediente._id, '/ingredientes/' + ingrediente._id, 'DELETE');
  }

  function reactivar(ingrediente) {
    cambiarIngrediente(ingrediente._id, '/ingredientes/' + ingrediente._id, 'PATCH', { isDisponible: true });
  }

  // El ingrediente solo trae el id de su categoría: se busca el nombre en la lista de categorías.
  function nombreCategoria(idCategoria) {
    for (const categoria of categorias) {
      if (categoria._id === idCategoria) {
        return categoria.nombre;
      }
    }
    return '(sin categoría)';
  }

  // Lo mismo que ve el cliente: sale en el menú solo si está disponible y tiene stock.
  function estadoEnMenu(ingrediente) {
    if (ingrediente.isDisponible === false) {
      return 'Dado de baja';
    }
    if (ingrediente.cantidad === 0) {
      return 'Sin stock';
    }
    return 'En el menú';
  }

  if (cargando) {
    return <Cargando texto="Cargando los ingredientes…" />;
  }

  let ingredienteEditando = null;
  for (const ingrediente of ingredientes) {
    if (ingrediente._id === idEditando) {
      ingredienteEditando = ingrediente;
    }
  }

  let claveFormulario = 'nuevo';
  if (ingredienteEditando !== null) {
    claveFormulario = ingredienteEditando._id;
  }

  return (
    <div className="admin-ingredientes">
      <h2>Ingredientes</h2>

      <FormularioIngrediente
        key={claveFormulario}
        ingrediente={ingredienteEditando}
        ingredientes={ingredientes}
        categorias={categorias}
        alGuardar={ingredienteGuardado}
        alCancelar={cancelarEdicion}
      />

      {aviso !== '' && <p className="exito">{aviso}</p>}
      {error !== '' && <p className="error">{error}</p>}

      {ingredientes.length === 0 && <p>Todavía no hay ingredientes.</p>}

      {ingredientes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map(function (ingrediente) {
              const ocupado = idCambiando === ingrediente._id;

              return (
                <tr key={ingrediente._id}>
                  <td data-label="Nombre">{ingrediente.nombre}</td>
                  <td data-label="Categoría">{nombreCategoria(ingrediente.categoria)}</td>
                  <td data-label="Precio">{formatearPrecio(ingrediente.precio)}</td>
                  <td data-label="Stock">{ingrediente.cantidad}</td>
                  <td data-label="Estado">{estadoEnMenu(ingrediente)}</td>
                  <td className="acciones">
                    <button
                      type="button"
                      onClick={function () { empezarEdicion(ingrediente._id); }}
                      disabled={idEditando === ingrediente._id || ocupado}
                    >
                      Editar
                    </button>
                    <button type="button" onClick={function () { reponer(ingrediente); }} disabled={ocupado}>
                      Reponer
                    </button>
                    {ingrediente.isDisponible && (
                      <button type="button" className="boton-peligro" onClick={function () { darDeBaja(ingrediente); }} disabled={ocupado}>
                        Dar de baja
                      </button>
                    )}
                    {ingrediente.isDisponible === false && (
                      <button type="button" onClick={function () { reactivar(ingrediente); }} disabled={ocupado}>
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminIngredientes;