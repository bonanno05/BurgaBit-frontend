// Funciones para buscar texto en listas sin importar mayúsculas, tildes ni espacios de más.

export function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}


// true si la persona (un usuario, o el cliente de un pedido) tiene lo buscado
// en su nombre, apellido o email. textoBuscado tiene que llegar ya normalizado.
// Si no hay búsqueda, coincide siempre. Si no hay persona (por ejemplo, un pedido
// cuyo cliente se borró de la base: llega null), no coincide con ninguna búsqueda.
export function personaCoincide(persona, textoBuscado) {
  if (textoBuscado === '') {
    return true;
  }
  if (persona === null || persona === undefined) {
    return false;
  }
  const textoDeLaPersona = normalizarTexto(persona.nombre + ' ' + persona.apellido + ' ' + persona.email);
  return textoDeLaPersona.includes(textoBuscado);
}