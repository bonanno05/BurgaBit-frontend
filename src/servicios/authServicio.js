const URL_BACKEND = 'https://burgabit.onrender.com/api';

export async function iniciarSesion(email, password) {
  const respuesta = await fetch(URL_BACKEND + '/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email, password: password }),
  });

  const datos = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(datos.msg);
  }

  return datos.token;
}