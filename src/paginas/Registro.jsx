import { useState, useContext } from 'react';
import { Link } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import { registrarse, iniciarSesion } from '../servicios/authServicio';
import AvisoDemora from '../componentes/AvisoDemora';
import { erroresDeRegistro, hayErrores } from '../utilidades/validaciones';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetirPassword, setRepetirPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});
  const sesion = useContext(SesionContexto);

  function sacarError(campo) {
    if (errores[campo] === undefined) {
      return;
    }
    const nuevosErrores = { ...errores };
    delete nuevosErrores[campo];
    setErrores(nuevosErrores);
  }

  function cambiarNombre(evento) {
    setNombre(evento.target.value);
    sacarError('nombre');
  }

  function cambiarApellido(evento) {
    setApellido(evento.target.value);
    sacarError('apellido');
  }

  function cambiarEmail(evento) {
    setEmail(evento.target.value);
    sacarError('email');
  }

  function cambiarPassword(evento) {
    setPassword(evento.target.value);
    sacarError('password');
  }

  function cambiarRepetirPassword(evento) {
    setRepetirPassword(evento.target.value);
    sacarError('repetirPassword');
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    const nuevosErrores = erroresDeRegistro({
      nombre: nombre,
      apellido: apellido,
      email: email,
      password: password,
      repetirPassword: repetirPassword,
    });
    setErrores(nuevosErrores);
    setError('');
    if (hayErrores(nuevosErrores)) {
      return;
    }

    setCargando(true);

    const emailLimpio = email.trim().toLowerCase();

    try {
      await registrarse(nombre.trim(), apellido.trim(), emailLimpio, password);
      const token = await iniciarSesion(emailLimpio, password);
      sesion.guardarSesion(token);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pantalla-sesion">
      <div className="sesion-foto"></div>

      <div className="registro">

        <p className="marca-sesion">
          Burga<span className="barra-marca-bit">Bit</span>
        </p>

        <h2>Crear cuenta</h2>

        <form onSubmit={enviarFormulario} noValidate>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" autoComplete="given-name" value={nombre} onChange={cambiarNombre} aria-invalid={errores.nombre !== undefined} aria-describedby="error-nombre" />
          {errores.nombre !== undefined && <p id="error-nombre" className="error-campo">{errores.nombre}</p>}

          <label htmlFor="apellido">Apellido</label>
          <input id="apellido" type="text" autoComplete="family-name" value={apellido} onChange={cambiarApellido} aria-invalid={errores.apellido !== undefined} aria-describedby="error-apellido" />
          {errores.apellido !== undefined && <p id="error-apellido" className="error-campo">{errores.apellido}</p>}

          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={cambiarEmail} aria-invalid={errores.email !== undefined} aria-describedby="error-email" />
          {errores.email !== undefined && <p id="error-email" className="error-campo">{errores.email}</p>}

          <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
          <input id="password" type="password" autoComplete="new-password" value={password} onChange={cambiarPassword} aria-invalid={errores.password !== undefined} aria-describedby="error-password" />
          {errores.password !== undefined && <p id="error-password" className="error-campo">{errores.password}</p>}

          <label htmlFor="repetirPassword">Repetir contraseña</label>
          <input id="repetirPassword" type="password" autoComplete="new-password" value={repetirPassword} onChange={cambiarRepetirPassword} aria-invalid={errores.repetirPassword !== undefined} aria-describedby="error-repetirPassword" />
          {errores.repetirPassword !== undefined && <p id="error-repetirPassword" className="error-campo">{errores.repetirPassword}</p>}

          {error !== '' && <p className="error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          {cargando && <AvisoDemora />}
        </form>

        <p>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;