import { useState } from "react"; //importa funcion useState de react

function Login() { //componente

  const [email, setEmail] = useState(''); //crea un estado vacio separado en dos variables
  const [password, setPassword] = useState(''); //crea un estado vacio separado en dos variables

  function cambiarEmail(evento) { //funcion que se ejecuta en la tecla
    setEmail(evento.target.value);
  }

  function cambiarPassword(evento) { //funcion que se ejecuta en la tecla
    setPassword(evento.target.value);
  }

  function enviarFormulario(evento) {
    evento.preventDefault();

    console.log('Email:', email);
    console.log('Password:', password);

  }
  return (
    <div className="login"> 
      <h2>Iniciar sesión</h2>

      <form onSubmit={enviarFormulario}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={cambiarEmail}/>

        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" value={password} onChange={cambiarPassword}/>

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;