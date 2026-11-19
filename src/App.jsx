import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { SesionContexto } from './contexto/SesionContexto';
import { inicioSegunRol } from './contexto/inicioSegunRol';
import BarraNavegacion from './componentes/BarraNavegacion';
import RutaProtegida from './componentes/RutaProtegida';
import PaginaProvisoria from './componentes/PaginaProvisoria';
import Login from './paginas/Login';
import Registro from './paginas/Registro';
import MisPedidos from './paginas/MisPedidos';

function App() {
  const sesion = useContext(SesionContexto);
  const inicio = inicioSegunRol(sesion.rol);
  const haySesion = sesion.token !== null;

  return (
    <>
      {haySesion && <BarraNavegacion />}

      <Routes>
        <Route path="/" element={<Navigate to={inicio} replace />} />

        <Route
          path="/login"
          element={haySesion ? <Navigate to={inicio} replace /> : <Login />}
        />
        <Route
          path="/registro"
          element={haySesion ? <Navigate to={inicio} replace /> : <Registro />}
        />

        <Route
          path="/armar"
          element={
            <RutaProtegida rolesPermitidos={['cliente']}>
              <PaginaProvisoria titulo="Armar hamburguesa" />
            </RutaProtegida>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <RutaProtegida rolesPermitidos={['cliente']}>
              <MisPedidos/>
            </RutaProtegida>
          }
        />

        <Route
          path="/cocina"
          element={
            <RutaProtegida rolesPermitidos={['cocinero']}>
              <PaginaProvisoria titulo="Pedidos de cocina" />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <RutaProtegida rolesPermitidos={['administrador']}>
              <PaginaProvisoria titulo="Pedidos (admin)" />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida rolesPermitidos={['administrador']}>
              <PaginaProvisoria titulo="Usuarios" />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/ingredientes"
          element={
            <RutaProtegida rolesPermitidos={['administrador']}>
              <PaginaProvisoria titulo="Ingredientes" />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <RutaProtegida rolesPermitidos={['administrador']}>
              <PaginaProvisoria titulo="Categorías" />
            </RutaProtegida>
          }
        />

        <Route
          path="/perfil"
          element={
            <RutaProtegida rolesPermitidos={['cliente', 'cocinero', 'administrador']}>
              <PaginaProvisoria titulo="Mi perfil" />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;