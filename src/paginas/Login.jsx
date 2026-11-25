import { iniciarSesion } from '../servicios/authServicio'; //importa funcion de servicio de autenticación
import { useState, useContext } from 'react';
import { SesionContexto } from '../contexto/SesionContexto';
import { Link } from 'react-router';
import { esEmailValido } from '../utilidades/validaciones';
import AvisoDemora from '../componentes/AvisoDemora';

function Login() { //componente

  const [email, setEmail] = useState(''); //crea un estado vacio separado en dos variables
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const sesion = useContext(SesionContexto);


  function cambiarEmail(evento) { //funcion que se ejecuta en la tecla
    setEmail(evento.target.value);
  }

  function cambiarPassword(evento) { //funcion que se ejecuta en la tecla
    setPassword(evento.target.value);
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    if (email.trim() === ''){ //.trim devuelve el texto sin espacios al principio ni al final
      setError('El mail es obligatorio');
      return;
    }

    if (esEmailValido(email) === false) {
      setError('El email no tiene un formato válido.');
      return;
    }

    if (password.trim() === ''){
      setError('La contraseña es obligatoria.');
      return;
    }

    setError('');
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
            <input id="email" type="email" autoComplete="email" value={email} onChange={cambiarEmail}/>
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={cambiarPassword}/>

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