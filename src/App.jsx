import { useContext } from 'react';
import { SesionContexto } from './contexto/SesionContexto';
import Login from './paginas/Login';

function App() {
  const sesion = useContext(SesionContexto);

  if (sesion.token === null) {
    return <Login />;
  }

  return (
    <div>
      <p>Sesión iniciada. Rol: {sesion.rol}</p>
      <button onClick={sesion.cerrarSesion}>Cerrar sesión</button>
    </div>
  );
}

export default App;