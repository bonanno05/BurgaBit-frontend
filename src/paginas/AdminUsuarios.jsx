import { useState, useEffect, useContext } from 'react';
import { SesionContexto } from '../contexto/SesionContexto';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import FormularioEmpleado from '../componentes/FormularioEmpleado';
import Cargando from '../componentes/Cargando';
import { normalizarTexto } from '../utilidades/busqueda';

// Opciones del desplegable de rol. "valor" es el rol como lo guarda el backend.
const ROLES = [
  { valor: 'cliente', texto: 'Clientes' },
  { valor: 'cocinero', texto: 'Cocineros' },
  { valor: 'administrador', texto: 'Administradores' },
];

// true si el usuario tiene el rol elegido ('' = todos) y su nombre, apellido o email
// contiene lo buscado. textoBuscado ya llega normalizado: se normaliza una sola vez,
// no una vez por cada usuario.
function usuarioCoincide(usuario, textoBuscado, rol) {
  if (rol !== '' && usuario.rol !== rol) {
    return false;
  }
  if (textoBuscado === '') {
    return true;
  }
  const textoDelUsuario = normalizarTexto(usuario.nombre + ' ' + usuario.apellido + ' ' + usuario.email);
  return textoDelUsuario.includes(textoBuscado);
}
function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [idCambiando, setIdCambiando] = useState('');
  // Lo que se escribe en el buscador y el rol elegido en el desplegable.
  const [busqueda, setBusqueda] = useState('');
  const [rolElegido, setRolElegido] = useState('');
  const sesion = useContext(SesionContexto);
  const pedirConSesion = usePedidoConSesion();

  // Trae todos los usuarios (sin contraseña), ordenados por rol y apellido.
  useEffect(function () {
    async function cargarUsuarios() {
      try {
        const datos = await pedirConSesion('/admin/usuarios', 'GET');
        setUsuarios(datos);
      } catch (fallo) {
        setError(fallo.message);
      } finally {
        setCargando(false);
      }
    }

    cargarUsuarios();
  }, [pedirConSesion]);

  // Se llama cuando el formulario crea una cuenta: vuelve a pedir la lista para que aparezca.
  async function recargarUsuarios() {
    try {
      const datos = await pedirConSesion('/admin/usuarios', 'GET');
      setUsuarios(datos);
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  // Activa o desactiva una cuenta (el backend la da vuelta: si estaba activa la desactiva y al revés).
  async function cambiarActivo(usuario) {
    let pregunta = '¿Desactivar la cuenta de ' + usuario.nombre + ' ' + usuario.apellido + '? No va a poder ingresar.';
    if (usuario.isActivo === false) {
      pregunta = '¿Volver a activar la cuenta de ' + usuario.nombre + ' ' + usuario.apellido + '?';
    }
    const confirmado = window.confirm(pregunta);
    if (confirmado === false) {
      return;
    }

    setError('');
    setIdCambiando(usuario._id);

    try {
      await pedirConSesion('/admin/usuario/' + usuario._id, 'PATCH');

      // La respuesta solo trae un mensaje: se da vuelta isActivo en la copia local.
      const usuariosNuevos = usuarios.map(function (otro) {
        if (otro._id === usuario._id) {
          return { ...otro, isActivo: !otro.isActivo };
        }
        return otro;
      });
      setUsuarios(usuariosNuevos);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setIdCambiando('');
    }
  }

  function cambiarBusqueda(evento) {
    setBusqueda(evento.target.value);
  }

  function cambiarRol(evento) {
    setRolElegido(evento.target.value);
  }

  if (cargando) {
    return <Cargando texto="Cargando los usuarios…" />;
  }

  // La lista que se ve NO es otro estado: se calcula en cada dibujo a partir de la lista
  // completa y de los filtros (valor derivado). Así nunca queda desactualizada.
  const textoBuscado = normalizarTexto(busqueda);
  const usuariosVisibles = usuarios.filter(function (usuario) {
    return usuarioCoincide(usuario, textoBuscado, rolElegido);
  });

  return (
    <div className="admin-usuarios">
      <h2>Usuarios</h2>

      <FormularioEmpleado alCrear={recargarUsuarios} />

      {error !== '' && <p className="error">{error}</p>}

          <div className="filtro">
        <label>
          Buscar
          <input
            type="search"
            value={busqueda}
            onChange={cambiarBusqueda}
            placeholder="Nombre, apellido o email"
          />
        </label>

        <label>
          Rol
          <select value={rolElegido} onChange={cambiarRol}>
            <option value="">Todos</option>
            {ROLES.map(function (rol) {
              return (
                <option key={rol.valor} value={rol.valor}>
                  {rol.texto}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <p className="nota">
        Mostrando {usuariosVisibles.length} de {usuarios.length} usuarios.
      </p>

      {usuariosVisibles.length === 0 && <p>Ningún usuario coincide con la búsqueda.</p>}
      {usuariosVisibles.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuariosVisibles.map(function (usuario) {
              const esUnoMismo = usuario._id === sesion.idUsuario;

              return (
                <tr key={usuario._id}>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol}</td>
                  <td>{usuario.isActivo ? 'Activa' : 'Desactivada'}</td>
                  <td>
                    {esUnoMismo && <span>(tu cuenta)</span>}
                    {esUnoMismo === false && (
                      <button
                        type="button"
                        onClick={function () { cambiarActivo(usuario); }}
                        disabled={idCambiando === usuario._id}
                      >
                        {usuario.isActivo ? 'Desactivar' : 'Activar'}
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

export default AdminUsuarios;