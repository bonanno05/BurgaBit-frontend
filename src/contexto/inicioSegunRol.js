// Pantalla a la que va cada rol después del login.
export function inicioSegunRol(rol) {
  if (rol === 'cliente') {
    return '/armar';
  }
  if (rol === 'cocinero') {
    return '/cocina';
  }
  if (rol === 'administrador') {
    return '/admin';
  }
  return '/bienvenida';
}