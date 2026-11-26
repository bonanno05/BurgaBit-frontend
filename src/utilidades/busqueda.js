// Funciones para buscar texto en listas sin importar mayúsculas, tildes ni espacios de más.

export function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}