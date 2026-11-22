import { useState, useContext } from 'react';
import { Link } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';
import { registrarse, iniciarSesion } from '../servicios/authServicio';
import { esEmailValido } from '../utilidades/validaciones';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetirPassword, setRepetirPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const sesion = useContext(SesionContexto);

  function cambiarNombre(evento) {
    setNombre(evento.target.value);
  }

  function cambiarApellido(evento) {
    setApellido(evento.target.value);
  }

  function cambiarEmail(evento) {
    setEmail(evento.target.value);
  }

  function cambiarPassword(evento) {
    setPassword(evento.target.value);
  }

  function cambiarRepetirPassword(evento) {
    setRepetirPassword(evento.target.value);
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    if (nombre.trim() === '') {
      setError('El nombre es obligatorio.');
      return;
    }

    if (apellido.trim() === '') {
      setError('El apellido es obligatorio.');
      return;
    }

    if (email.trim() === '') {
      setError('El email es obligatorio.');
      return;
    }

      if (esEmailValido(email) === false) {
      setError('El email no tiene un formato válido.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== repetirPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
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
    <div className="registro">
      <h2>Crear cuenta</h2>

      <form onSubmit={enviarFormulario} noValidate>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" type="text" value={nombre} onChange={cambiarNombre} />

        <label htmlFor="apellido">Apellido</label>
        <input id="apellido" type="text" value={apellido} onChange={cambiarApellido} />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={cambiarEmail} />

        <label htmlFor="password">Contraseña (mínimo 8 caracteres)</label>
        <input id="password" type="password" value={password} onChange={cambiarPassword} />

        <label htmlFor="repetirPassword">Repetir contraseña</label>
        <input id="repetirPassword" type="password" value={repetirPassword} onChange={cambiarRepetirPassword} />

        {error !== '' && <p className="error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </div>
  );
}

export default Registro;