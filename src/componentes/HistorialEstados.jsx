import { formatearFecha } from '../utilidades/formato';

// Lista de cambios de estado de un pedido: cuándo, a qué estado, quién lo hizo y el motivo si se canceló.
// Recibe historialEstados tal como lo devuelve GET /api/admin/:id (con el usuario completo).
function HistorialEstados(props) {
  return (
    <ol className="historial">
      {props.historial.map(function (cambio, posicion) {
        // El primer registro (Pendiente) no guarda usuario: lo crea el cliente al hacer el pedido.
        let quien = 'el cliente';
        if (cambio.usuario !== undefined && cambio.usuario !== null) {
          quien = cambio.usuario.nombre + ' ' + cambio.usuario.apellido + ' (' + cambio.usuario.rol + ')';
        }

        return (
          <li key={posicion}>
            {formatearFecha(cambio.fecha)}: {cambio.estado}, por {quien}
            {cambio.motivo !== undefined && <span>. Motivo: {cambio.motivo}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export default HistorialEstados;