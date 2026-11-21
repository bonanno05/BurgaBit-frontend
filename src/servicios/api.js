const URL_BACKEND = import.meta.env.VITE_URL_BACKEND;

// Hace un pedido al backend y devuelve los datos de la respuesta.
// Si algo sale mal, lanza un Error con un mensaje para mostrarle al usuario.
export async function pedirAlBackend(ruta, metodo, cuerpo, token) {
  const opciones = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (cuerpo !== undefined) {
    opciones.body = JSON.stringify(cuerpo);
  }

  if (token !== undefined) {
    opciones.headers.Authorization = 'Bearer ' + token;
  }

  let respuesta;

  try {
    respuesta = await fetch(URL_BACKEND + ruta, opciones);
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
    const fallo = new Error(datos.msg);
    fallo.status = respuesta.status;
    throw fallo;
  }

  return datos;
}