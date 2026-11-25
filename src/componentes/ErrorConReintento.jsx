// Error al cargar una página, con un botón para volver a intentar.
// Reintentar recarga la página entera: es lo más simple y vuelve a pedir todo.
// En el armador no se pierde nada, porque el pedido sin confirmar queda guardado en el navegador.
function ErrorConReintento(props) {
  function reintentar() {
    window.location.reload();
  }

  return (
    <div className="error-reintento">
      <p className="error">{props.mensaje}</p>
      <button type="button" onClick={reintentar}>
        Reintentar
      </button>
    </div>
  );
}

export default ErrorConReintento;