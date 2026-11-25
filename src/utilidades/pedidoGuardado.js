// Guarda en el navegador (localStorage) las hamburguesas agregadas que todavía no se confirmaron,
// para que no se pierdan si se recarga la página o se cierra la pestaña.
// Cada usuario tiene su propia clave: si en la misma compu entra otra persona, no ve el pedido del anterior.

function claveDelPedido(idUsuario) {
  return 'burgabit-pedido-' + idUsuario;
}

// Devuelve las hamburguesas guardadas, o una lista vacía si no hay nada
// (o si lo guardado está roto: por ejemplo, si alguien lo modificó a mano).
export function leerPedidoGuardado(idUsuario) {
  try {
    const texto = localStorage.getItem(claveDelPedido(idUsuario));
    if (texto === null) {
      return [];
    }
    const productos = JSON.parse(texto);
    if (Array.isArray(productos) === false) {
      return [];
    }
    return productos;
  } catch {
    return [];
  }
}

// localStorage solo guarda texto: la lista se convierte con JSON.stringify.
// Si no queda ninguna hamburguesa, se borra la clave para no dejar basura.
export function guardarPedido(idUsuario, productos) {
  if (productos.length === 0) {
    localStorage.removeItem(claveDelPedido(idUsuario));
    return;
  }
  localStorage.setItem(claveDelPedido(idUsuario), JSON.stringify(productos));
}

export function borrarPedidoGuardado(idUsuario) {
  localStorage.removeItem(claveDelPedido(idUsuario));
}