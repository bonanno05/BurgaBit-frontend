import { pedirAlBackend } from './api';

export async function iniciarSesion(email, password) {
  const datos = await pedirAlBackend('/auth/login', 'POST', {
    email: email,
    password: password,
  });

  return datos.token;
}

export async function registrarse(nombre, apellido, email, password) {
  const datos = await pedirAlBackend('/auth/registrar', 'POST', {
    nombre: nombre,
    apellido: apellido,
    email: email,
    password: password,
  });

  return datos.msg;
}