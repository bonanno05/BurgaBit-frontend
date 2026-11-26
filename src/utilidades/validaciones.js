// Validaciones que se usan en varios formularios
// son funcines puras que reciben un texto y devuelven true o false

// El mismo formato de email que pide el modelo Usuario del backend
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// true si el texto tiene forma de email (algo@algo.algo)
export function esEmailValido(texto) {
  return FORMATO_EMAIL.test(texto.trim());
}

// true si el texto es un número entero mayor o igual a "desde" (ej.: "2" con desde 1 → true; "1.5" o "" → false)
export function esEnteroDesde(texto, desde) {
  if (texto.trim() === '') {
    return false;
  }
  const numero = Number(texto);
  return Number.isInteger(numero) && numero >= desde;
}

// true si el texto es un número (puede tener decimales) mayor o igual a 0
export function esNumeroDesdeCero(texto) {
  if (texto.trim() === '') {
    return false;
  }
  const numero = Number(texto);
  return Number.isNaN(numero) === false && numero >= 0;
}


// ---------- Errores por campo (Login y Registro) ----------
// Estas funciones revisan TODOS los campos de una vez y devuelven un objeto
// con un mensaje por cada campo que está mal, por ejemplo { email: 'Falta el email.' }.
// Si todo está bien, devuelven un objeto vacío: {}.

function errorDeEmail(email) {
  if (email.trim() === '') {
    return 'Falta el email.';
  }
  if (esEmailValido(email) === false) {
    return 'El email tiene que tener la forma nombre@mail.com.';
  }
  return '';
}

export function erroresDeLogin(email, password) {
  const errores = {};

  const mensajeEmail = errorDeEmail(email);
  if (mensajeEmail !== '') {
    errores.email = mensajeEmail;
  }

  if (password.trim() === '') {
    errores.password = 'Falta la contraseña.';
  }

  return errores;
}

// datos: { nombre, apellido, email, password, repetirPassword }
export function erroresDeRegistro(datos) {
  const errores = {};

  if (datos.nombre.trim() === '') {
    errores.nombre = 'Falta el nombre.';
  }

  if (datos.apellido.trim() === '') {
    errores.apellido = 'Falta el apellido.';
  }

  const mensajeEmail = errorDeEmail(datos.email);
  if (mensajeEmail !== '') {
    errores.email = mensajeEmail;
  }

  if (datos.password.length < 8) {
    errores.password = 'La contraseña tiene que tener 8 caracteres o más.';
  }

  if (datos.repetirPassword !== datos.password) {
    errores.repetirPassword = 'No coincide con la contraseña de arriba.';
  }

  return errores;
}

// true si el objeto de errores tiene al menos un campo con error.
export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}