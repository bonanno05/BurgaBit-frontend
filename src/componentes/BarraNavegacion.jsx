import { useContext } from 'react';
import { NavLink } from 'react-router';
import { SesionContexto } from '../contexto/SesionContexto';

function BarraNavegacion() {
  const sesion = useContext(SesionContexto);

  return (
    <nav className="barra">
      <span className="barra-marca">BurgaBit</span>

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
          <NavLink to="/admin/pedidos">Pedidos</NavLink>
          <NavLink to="/admin/usuarios">Usuarios</NavLink>
          <NavLink to="/admin/ingredientes">Ingredientes</NavLink>
          <NavLink to="/admin/categorias">Categorías</NavLink>
        </>
      )}

      <NavLink to="/perfil">Mi perfil</NavLink>
      <button onClick={sesion.cerrarSesion}>Cerrar sesión</button>
    </nav>
  );
}

export default BarraNavegacion;