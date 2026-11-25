import AvisoDemora from './AvisoDemora';

// Pantalla de carga que se repite en varias páginas: un círculo que gira, el texto
// que llega por props (por ejemplo "Cargando el menú…") y, si tarda, el aviso del servidor dormido.
// role="status" hace que un lector de pantalla anuncie el texto.
function Cargando(props) {
  return (
    <div className="cargando" role="status">
      <span className="cargando-icono" aria-hidden="true"></span>
      <p>{props.texto}</p>
      <AvisoDemora />
    </div>
  );
}

export default Cargando;