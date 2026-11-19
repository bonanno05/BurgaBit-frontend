const URL_BACKEND = 'https://burgabit.onrender.com/api';

export async function iniciarSesion(email, password) {
  let respuesta;

  try {
    respuesta = await fetch(URL_BACKEND + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password: password }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Probá de nuevo en unos segundos.');
  }

  let datos;

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error('El servidor respondió algo inesperado. Probá de nuevo.');
  }

  if (respuesta.ok === false) {
    throw new Error(datos.msg);
  }

  return datos.token;
}