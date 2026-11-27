import { useState } from 'react';
import { usePedidoConSesion } from '../contexto/usePedidoConSesion';

// Formulario del admin para crear una cuenta de cocinero o de administrador.
// El mail no se escribe: lo arma el backend con nombre + apellido + un número (ej.: juanperez123@burgabit.com).
function FormularioEmpleado(props) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cocinero');
  const [error, setError] = useState('');
  const [mailCreado, setMailCreado] = useState('');
  const [enviando, setEnviando] = useState(false);

  const pedirConSesion = usePedidoConSesion();

  async function crearCuenta(evento) {
    evento.preventDefault();
    setError('');
    setMailCreado('');

    if (nombre.trim() === '') {
      setError('El nombre es obligatorio.');
      return;
    }
    if (apellido.trim() === '') {
      setError('El apellido es obligatorio.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // POST /admin/cocinero o POST /admin/admin, según el rol elegido.
    let ruta = '/admin/cocinero';
    if (rol === 'administrador') {
      ruta = '/admin/admin';
    }

    setEnviando(true);
    try {
      const datos = await pedirConSesion(ruta, 'POST', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        password: password,
      });
      setMailCreado(datos.email);
      setNombre('');
      setApellido('');
      setPassword('');
      props.alCrear();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario-empleado" onSubmit={crearCuenta} noValidate>
      <h3>Crear cuenta de empleado</h3>

      <label>
        Nombre
        <input
          type="text"
          value={nombre}
          onChange={function (evento) { setNombre(evento.target.value); }}
        />
      </label>

      <label>
        Apellido
        <input
          type="text"
          value={apellido}
          onChange={function (evento) { setApellido(evento.target.value); }}
        />
      </label>

      <label>
        Contraseña inicial
        <input
          type="password"
          value={password}
          onChange={function (evento) { setPassword(evento.target.value); }}
        />
      </label>

      <label>
        Rol
        <select value={rol} onChange={function (evento) { setRol(evento.target.value); }}>
          <option value="cocinero">Cocinero</option>
          <option value="administrador">Administrador</option>
        </select>
      </label>

      {error !== '' && <p className="error">{error}</p>}

      {mailCreado !== '' && (
        <p className="exito">
          Cuenta creada. Para ingresar se usa el mail <strong>{mailCreado}</strong> y la contraseña que pusiste.
        </p>
      )}

      <button type="submit" disabled={enviando}>
        {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  );
}

export default FormularioEmpleado;