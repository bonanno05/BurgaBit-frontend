import { useState } from 'react';
import { SesionContexto } from './SesionContexto';

// Lee la parte del medio del JWT (los datos) y la convierte en objeto.
// No verifica la firma: eso solo lo puede hacer el backend, que tiene el secreto.
function leerDatosDelToken(token) {
  try {
    const partes = token.split('.');
    const datosEnBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const datosEnTexto = atob(datosEnBase64);
    return JSON.parse(datosEnTexto);
  } catch {
    return null;
  }
}

// Al arrancar la app: devuelve el token guardado solo si existe y no venció.
function buscarTokenGuardado() {
  const token = localStorage.getItem('token');

  if (token === null) {
    return null;
  }

  const datos = leerDatosDelToken(token);

  if (datos === null) {
    localStorage.removeItem('token');
    return null;
  }

  const ahoraEnSegundos = Date.now() / 1000;

  if (datos.exp < ahoraEnSegundos) {
    localStorage.removeItem('token');
    return null;
  }

  return token;
}

export function SesionProveedor(props) {
  const [token, setToken] = useState(buscarTokenGuardado);

  let rol = null;
  if (token !== null) {
    const datos = leerDatosDelToken(token);
    rol = datos.rol;
  }

  function guardarSesion(tokenNuevo) {
    localStorage.setItem('token', tokenNuevo);
    setToken(tokenNuevo);
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    setToken(null);
  }

  const valor = {
    token: token,
    rol: rol,
    guardarSesion: guardarSesion,
    cerrarSesion: cerrarSesion,
  };

  return (
    <SesionContexto value={valor}>
      {props.children}
    </SesionContexto>
  );
}