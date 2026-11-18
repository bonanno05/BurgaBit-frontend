function Login() { //componente
  return (
    <div className="login"> 
      <h2>Iniciar sesión</h2>

      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" />

        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;