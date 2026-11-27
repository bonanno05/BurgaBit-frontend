import { useState } from 'react';
import { useCargarDatos } from '../contexto/useCargarDatos';
import FormularioCategoria from '../componentes/FormularioCategoria';
import Cargando from '../componentes/Cargando';
import ErrorConReintento from '../componentes/ErrorConReintento';

function AdminCategorias() {
  // Todas las categorías, ordenadas por paso.
  const carga = useCargarDatos('/categorias');
  const categorias = carga.datos;
  const [aviso, setAviso] = useState('');
  const [idEditando, setIdEditando] = useState('');

  // El formulario avisa que guardó: se muestra el mensaje del backend, se cierra la edición y se recarga la lista.
  function categoriaGuardada(mensaje) {
    setAviso(mensaje);
    setIdEditando('');
    carga.recargar();
  }

  function empezarEdicion(id) {
    setAviso('');
    setIdEditando(id);
  }

  function cancelarEdicion() {
    setIdEditando('');
  }

  if (carga.cargando) {
    return <Cargando texto="Cargando las categorías…" />;
  }

  // Si no se pudo traer la lista, se muestra el error solo (y no "Todavía no hay categorías").
  if (carga.error !== '') {
    return <ErrorConReintento mensaje={carga.error} />;
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