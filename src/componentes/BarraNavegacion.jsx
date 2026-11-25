import { useContext } from 'react';
import { NavLink } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';

function BarraNavegacion() {
  const sesion = useContext(SesionContexto);

  return (
    <nav className="barra">
      <span className="barra-marca">
        Burga<span className="barra-marca-bit">Bit</span>
      </span>

      {/* Las secciones van juntas en un div para poder acomodarlas con CSS
          (en celular, en una segunda fila). */}
      <div className="barra-links">
        {sesion.rol === 'cliente' && (
          <>
            <NavLink to="/armar">Armar hamburguesa</NavLink>
            <NavLink to="/mis-pedidos">Mis pedidos</NavLink>
          </>
        )}

        {sesion.rol === 'cocinero' && (
          <NavLink to="/cocina">Pedidos</NavLink>
        )}

        {sesion.rol === 'administrador' && (
          <>
            <NavLink to="/admin" end>Inicio</NavLink>
            <NavLink to="/admin/pedidos">Pedidos</NavLink>
            <NavLink to="/admin/usuarios">Usuarios</NavLink>
            <NavLink to="/admin/ingredientes">Ingredientes</NavLink>
            <NavLink to="/admin/categorias">Categorías</NavLink>
          </>
        )}
      </div>

      <button type="button" className="barra-salir" onClick={sesion.cerrarSesion}>
        Cerrar sesión
      </button>
    </nav>
  );
}

export default BarraNavegacion;