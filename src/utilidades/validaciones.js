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