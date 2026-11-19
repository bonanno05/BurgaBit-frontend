// Funciones para mostrar datos con formato argentino.

export function formatearPrecio(numero) {
  return '$ ' + numero.toLocaleString('es-AR');
}

export function formatearFecha(textoFecha) {
  const fecha = new Date(textoFecha);
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}