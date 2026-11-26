import { iniciarSesion } from '../servicios/authServicio'; //importa funcion de servicio de autenticación
import { useState, useContext } from 'react';
import { SesionContexto } from '../contexto/SesionContexto';
import { Link } from 'react-router';
import { erroresDeLogin, hayErrores } from '../utilidades/validaciones';
import AvisoDemora from '../componentes/AvisoDemora';

function Login() { //componente

  const [email, setEmail] = useState(''); //crea un estado vacio separado en dos variables
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const sesion = useContext(SesionContexto);
  const [errores, setErrores] = useState({});

  // Al escribir en un campo con error, se borra el error de ese campo.
  // Se arma una copia sin ese campo: el estado no se modifica directo.
  function sacarError(campo) {
    if (errores[campo] === undefined) {
      return;
    }
    const nuevosErrores = { ...errores };
    delete nuevosErrores[campo];
    setErrores(nuevosErrores);
  }


  function cambiarEmail(evento) { //funcion que se ejecuta en la tecla
    setEmail(evento.target.value);
    sacarError('email');
  }

  function cambiarPassword(evento) { //funcion que se ejecuta en la tecla
    setPassword(evento.target.value);
    sacarError('password');
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    // Se revisan todos los campos juntos: así se ven todos los errores de una vez.
    const nuevosErrores = erroresDeLogin(email, password);
    setErrores(nuevosErrores);
    setError('');
    if (hayErrores(nuevosErrores)) {
      return;
    }

    setCargando(true);

    try{

      const token = await iniciarSesion(email.trim().toLowerCase(), password);
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

        <div className="login">

          <p className="marca-sesion">
            Burga<span className="barra-marca-bit">Bit</span>
          </p>
          
          <h2>Iniciar sesión</h2>

          <form onSubmit={enviarFormulario} noValidate>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={cambiarEmail} aria-invalid={errores.email !== undefined} aria-describedby="error-email"/>
            {errores.email !== undefined && <p id="error-email" className="error-campo">{errores.email}</p>}
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={cambiarPassword} aria-invalid={errores.password !== undefined} aria-describedby="error-password"/>
            {errores.password !== undefined && <p id="error-password" className="error-campo">{errores.password}</p>}
            {error !== '' && <p className='error'>{error}</p>} {/*hace aparecer el error en la pantalla*/}
            
            <button type="submit" disabled={cargando}>{cargando ? 'Ingresando' : 'Ingresar' }</button>
            {cargando && <AvisoDemora />}
          </form>
          <p>
            ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
          </p>
        </div>
    </div>
  );
}

export default Login;