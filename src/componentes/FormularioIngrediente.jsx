import { useState } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';

// true si el texto es un número (puede tener decimales) mayor o igual a 0.
function esNumeroPositivo(texto) {
  if (texto.trim() === '') {
    return false;
  }
  const numero = Number(texto);
  return Number.isNaN(numero) === false && numero >= 0;
}

// true si el texto es un número entero mayor o igual a 0.
function esEnteroPositivo(texto) {
  if (texto.trim() === '') {
    return false;
  }
  const numero = Number(texto);
  return Number.isInteger(numero) && numero >= 0;
}

// Formulario para crear un ingrediente (props.ingrediente es null) o para editarlo.
// Al editar no se puede cambiar la categoría: el backend no lo permite.
function FormularioIngrediente(props) {
  const editando = props.ingrediente !== null;

  let inicial = { nombre: '', precio: '', cantidad: '', categoria: '' };
  if (editando) {
    inicial = {
      nombre: props.ingrediente.nombre,
      precio: String(props.ingrediente.precio),
      cantidad: String(props.ingrediente.cantidad),
      categoria: props.ingrediente.categoria,
    };
  }

  const [nombre, setNombre] = useState(inicial.nombre);
  const [precio, setPrecio] = useState(inicial.precio);
  const [cantidad, setCantidad] = useState(inicial.cantidad);
  const [categoria, setCategoria] = useState(inicial.categoria);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const pedirConSesion = usePedidoConSesion();

  // true si otro ingrediente (no el que se edita) ya usa ese nombre.
  function nombreRepetido(nombreLimpio) {
    for (const ingrediente of props.ingredientes) {
      const esElMismo = editando && ingrediente._id === props.ingrediente._id;
      if (esElMismo === false && ingrediente.nombre === nombreLimpio) {
        return true;
      }
    }
    return false;
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError('');

    // El backend guarda el nombre en minúsculas: se compara y se manda igual.
    const nombreLimpio = nombre.trim().toLowerCase();

    if (nombreLimpio === '') {
      setError('El nombre es obligatorio');
      return;
    }
    if (nombreRepetido(nombreLimpio)) {
      setError('Ya existe un ingrediente con ese nombre');
      return;
    }
    if (esNumeroPositivo(precio) === false) {
      setError('El precio tiene que ser un número desde 0');
      return;
    }
    if (esEnteroPositivo(cantidad) === false) {
      setError('El stock tiene que ser un número entero desde 0');
      return;
    }
    if (categoria === '') {
      setError('Elegí una categoría');
      return;
    }

    setEnviando(true);
    try {
      let datos;
      if (editando) {
        datos = await pedirConSesion('/ingredientes/' + props.ingrediente._id, 'PATCH', {
          nombre: nombreLimpio,
          precio: Number(precio),
          cantidad: Number(cantidad),
        });
      } else {
        datos = await pedirConSesion('/ingredientes', 'POST', {
          nombre: nombreLimpio,
          precio: Number(precio),
          cantidad: Number(cantidad),
          categoria: categoria,
        });
        setNombre('');
        setPrecio('');
        setCantidad('');
        setCategoria('');
      }
      props.alGuardar(datos.msg);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  let textoBoton = 'Crear ingrediente';
  if (editando) {
    textoBoton = 'Guardar cambios';
  }
  if (enviando) {
    textoBoton = 'Guardando…';
  }

  return (
    <form className="formulario-ingrediente" onSubmit={guardar} noValidate>
      <h3>{editando ? 'Editar "' + props.ingrediente.nombre + '"' : 'Nuevo ingrediente'}</h3>

      <label>
        Nombre
        <input
          type="text"
          value={nombre}
          onChange={function (evento) { setNombre(evento.target.value); }}
        />
      </label>

      <label>
        Precio
        <input
          type="number"
          value={precio}
          onChange={function (evento) { setPrecio(evento.target.value); }}
        />
      </label>

      <label>
        Stock
        <input
          type="number"
          value={cantidad}
          onChange={function (evento) { setCantidad(evento.target.value); }}
        />
      </label>

      <label>
        Categoría
        <select
          value={categoria}
          onChange={function (evento) { setCategoria(evento.target.value); }}
          disabled={editando}
        >
          <option value="">Elegí una categoría</option>
          {props.categorias.map(function (opcion) {
            return (
              <option key={opcion._id} value={opcion._id}>
                {opcion.nombre}
              </option>
            );
          })}
        </select>
      </label>

      {editando && <p className="nota">La categoría no se puede cambiar una vez creado el ingrediente.</p>}

      {error !== '' && <p className="error">{error}</p>}

      <button type="submit" disabled={enviando}>
        {textoBoton}
      </button>

      {editando && (
        <button type="button" onClick={props.alCancelar} disabled={enviando}>
          Cancelar edición
        </button>
      )}
    </form>
  );
}

export default FormularioIngrediente;