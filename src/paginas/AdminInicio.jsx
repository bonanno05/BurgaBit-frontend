import { Link } from 'react-router';

// Inicio del admin: un acceso a cada sección. No pide nada al backend:
// los datos aparecen cuando el admin entra a una sección.
function AdminInicio() {
  return (
    <div className="admin-inicio">
      <h2>Hola, administrador</h2>
      <p>¿Qué querés ver?</p>

      <div className="accesos">
        <Link to="/admin/pedidos" className="acceso">
          <strong>Pedidos</strong>
          <span>Buscar pedidos por estado y ver su historial.</span>
        </Link>

        <Link to="/admin/usuarios" className="acceso">
          <strong>Usuarios</strong>
          <span>Activar o desactivar cuentas y crear empleados.</span>
        </Link>

        <Link to="/admin/ingredientes" className="acceso">
          <strong>Ingredientes</strong>
          <span>Precios, stock y disponibilidad en el menú.</span>
        </Link>

        <Link to="/admin/categorias" className="acceso">
          <strong>Categorías</strong>
          <span>Los pasos del armado de la hamburguesa.</span>
        </Link>
      </div>
    </div>
  );
}

export default AdminInicio;