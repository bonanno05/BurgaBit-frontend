import { useState, useEffect } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import FormularioCategoria from '../componentes/FormularioCategoria';
import Cargando from '../componentes/Cargando';

function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [idEditando, setIdEditando] = useState('');

  const pedirConSesion = usePedidoConSesion();

  // Trae todas las categorías, ordenadas por paso.
  useEffect(function () {
    async function cargarCategorias() {
      try {
        const datos = await pedirConSesion('/categorias', 'GET');
        setCategorias(datos);
      } catch (fallo) {
        setError(fallo.message);
      } finally {
        setCargando(false);
      }
    }

    cargarCategorias();
  }, [pedirConSesion]);

  async function recargarCategorias() {
    try {
      const datos = await pedirConSesion('/categorias', 'GET');
      setCategorias(datos);
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  // El formulario avisa que guardó: se muestra el mensaje del backend, se cierra la edición y se recarga la lista.
  function categoriaGuardada(mensaje) {
    setError('');
    setAviso(mensaje);
    setIdEditando('');
    recargarCategorias();
  }

  function empezarEdicion(id) {
    setAviso('');
    setIdEditando(id);
  }

  function cancelarEdicion() {
    setIdEditando('');
  }

  if (cargando) {
    return <Cargando texto="Cargando las categorías…" />;
  }

  // La categoría que se está editando (o null si se está creando una nueva).
  let categoriaEditando = null;
  for (const categoria of categorias) {
    if (categoria._id === idEditando) {
      categoriaEditando = categoria;
    }
  }

  // La key hace que React cree el formulario de nuevo (con los campos de esa categoría) cada vez que cambia lo que se edita.
  let claveFormulario = 'nueva';
  if (categoriaEditando !== null) {
    claveFormulario = categoriaEditando._id;
  }

  return (
    <div className="admin-categorias">
      <h2>Categorías</h2>
      <p>Cada categoría es un paso del armado de la hamburguesa. El cliente las ve en el orden del paso.</p>

      <FormularioCategoria
        key={claveFormulario}
        categoria={categoriaEditando}
        categorias={categorias}
        alGuardar={categoriaGuardada}
        alCancelar={cancelarEdicion}
      />

      {aviso !== '' && <p className="exito">{aviso}</p>}
      {error !== '' && <p className="error">{error}</p>}

      {categorias.length === 0 && <p>Todavía no hay categorías.</p>}

      {categorias.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Paso</th>
              <th>Nombre</th>
              <th>Mínimo</th>
              <th>Máximo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(function (categoria) {
              return (
                <tr key={categoria._id}>
                  <td data-label="Paso">{categoria.paso}</td>
                  <td data-label="Nombre">{categoria.nombre}</td>
                  <td data-label="Mínimo">{categoria.minimo}</td>
                  <td data-label="Máximo">{categoria.maximo}</td>
                  <td className="acciones">
                    <button
                      type="button"
                      onClick={function () { empezarEdicion(categoria._id); }}
                      disabled={idEditando === categoria._id}
                    >
                      Editar
                    </button>
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

export default AdminCategorias;