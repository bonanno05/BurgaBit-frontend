import { useState, useEffect, useContext } from 'react';
import { SesionContexto } from '../contexto/SesionContexto';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';
import FormularioEmpleado from '../componentes/FormularioEmpleado';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [idCambiando, setIdCambiando] = useState('');

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

  if (cargando) {
    return <p>Cargando los usuarios…</p>;
  }

  return (
    <div className="admin-usuarios">
      <h2>Usuarios</h2>

      <FormularioEmpleado alCrear={recargarUsuarios} />

      {error !== '' && <p className="error">{error}</p>}

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
          {usuarios.map(function (usuario) {
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
    </div>
  );
}

export default AdminUsuarios;