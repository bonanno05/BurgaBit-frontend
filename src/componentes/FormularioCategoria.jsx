import { useState } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import { esEnteroDesde } from '../utilidades/validaciones';

// Formulario para crear una categoría (props.categoria es null) o para editarla (props.categoria es la categoría).
function FormularioCategoria(props) {
  const editando = props.categoria !== null;

  // Si se está editando, los campos arrancan con los valores actuales; si no, vacíos.
  // Los números se guardan como texto porque así los da el input.
  let inicial = { nombre: '', paso: '', minimo: '', maximo: '' };
  if (editando) {
    inicial = {
      nombre: props.categoria.nombre,
      paso: String(props.categoria.paso),
      minimo: String(props.categoria.minimo),
      maximo: String(props.categoria.maximo),
    };
  }

  const [nombre, setNombre] = useState(inicial.nombre);
  const [paso, setPaso] = useState(inicial.paso);
  const [minimo, setMinimo] = useState(inicial.minimo);
  const [maximo, setMaximo] = useState(inicial.maximo);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const pedirConSesion = usePedidoConSesion();

  // true si otra categoría (no la que se edita) ya usa ese nombre.
  function nombreRepetido(nombreLimpio) {
    for (const categoria of props.categorias) {
      const esLaMisma = editando && categoria._id === props.categoria._id;
      if (esLaMisma === false && categoria.nombre === nombreLimpio) {
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
      setError('Ya existe una categoría con ese nombre');
      return;
    }
    if (esEnteroDesde(paso, 1) === false) {
      setError('El paso tiene que ser un número entero desde 1');
      return;
    }
    if (esEnteroDesde(minimo, 0) === false) {
      setError('El mínimo tiene que ser un número entero desde 0');
      return;
    }
    if (esEnteroDesde(maximo, 1) === false) {
      setError('El máximo tiene que ser un número entero desde 1');
      return;
    }
    if (Number(minimo) > Number(maximo)) {
      setError('El mínimo no puede ser mayor que el máximo');
      return;
    }

    const cuerpo = {
      nombre: nombreLimpio,
      paso: Number(paso),
      minimo: Number(minimo),
      maximo: Number(maximo),
    };

    setEnviando(true);
    try {
      let datos;
      if (editando) {
        datos = await pedirConSesion('/categorias/' + props.categoria._id, 'PATCH', cuerpo);
      } else {
        datos = await pedirConSesion('/categorias', 'POST', cuerpo);
        setNombre('');
        setPaso('');
        setMinimo('');
        setMaximo('');
      }
      props.alGuardar(datos.msg);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  let textoBoton = 'Crear categoría';
  if (editando) {
    textoBoton = 'Guardar cambios';
  }
  if (enviando) {
    textoBoton = 'Guardando…';
  }

  return (
    <form className="formulario-categoria" onSubmit={guardar} noValidate>
      <h3>{editando ? 'Editar "' + props.categoria.nombre + '"' : 'Nueva categoría'}</h3>

      <label>
        Nombre
        <input
          type="text"
          value={nombre}
          onChange={function (evento) { setNombre(evento.target.value); }}
        />
      </label>

      <label>
        Paso (orden en el armado)
        <input
          type="number"
          value={paso}
          onChange={function (evento) { setPaso(evento.target.value); }}
        />
      </label>

      <label>
        Mínimo por hamburguesa
        <input
          type="number"
          value={minimo}
          onChange={function (evento) { setMinimo(evento.target.value); }}
        />
      </label>

      <label>
        Máximo por hamburguesa
        <input
          type="number"
          value={maximo}
          onChange={function (evento) { setMaximo(evento.target.value); }}
        />
      </label>

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

export default FormularioCategoria;