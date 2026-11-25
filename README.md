# BurgaBit — Frontend

Aplicación web (SPA) para armar hamburguesas paso a paso y seguir los pedidos. Es el frontend del proyecto BurgaBit de Programación III (INSPT-UTN): se conecta a la API REST del backend y la usa para todo (no tiene datos propios).

- **App publicada:** https://burgabit-frontend.onrender.com
- **Backend (API):** https://burgabit.onrender.com/api — repositorio: https://github.com/bonanno05/BurgaBit

> El backend está en el plan gratis de Render y se "duerme" si nadie lo usa: el primer pedido puede tardar hasta un minuto.

## Qué se puede hacer

Hay tres roles. Al iniciar sesión, cada uno va directo a su pantalla y solo ve sus opciones en la barra.

| Rol | Pantallas |
|---|---|
| **Cliente** | Registrarse e iniciar sesión. **Armar hamburguesa**: un paso por categoría (pan, carne, etc.), con − y + por ingrediente, respetando mínimos, máximos y stock; varias hamburguesas en un mismo pedido, precio estimado y confirmación. **Mis pedidos**: historial y cancelación mientras está Pendiente. |
| **Cocinero** | **Pedidos de cocina**: pedidos activos del más viejo al más nuevo; pasar al estado siguiente (Pendiente → En preparación → Lista para retirar → Entregada) o cancelar con motivo. |
| **Administrador** | **Pedidos**: todos, con filtro por estado e historial de cambios. **Usuarios**: activar/desactivar cuentas y crear cocineros y administradores. **Categorías**: crear y editar (son los pasos del armado). **Ingredientes**: crear, editar, reponer stock, dar de baja y reactivar. |

## Tecnologías y librerías

| Librería | Para qué se usa |
|---|---|
| [React 19](https://react.dev) (`react`, `react-dom`) | Componentes, estado (`useState`), efectos (`useEffect`), contexto (`useContext`) |
| [React Router 8](https://reactrouter.com) (`react-router`) | Rutas de la SPA, rutas protegidas por rol, navegación (`NavLink`, `Navigate`, `useNavigate`) |
| [Vite 8](https://vite.dev) | Servidor de desarrollo, build de producción y variables de entorno |
| [ESLint](https://eslint.org) con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh` | Revisión del código (reglas de los hooks) |

- **Estilos:** CSS propio en `src/index.css` (sin librerías), pensado primero para celular y adaptado a pantallas anchas con `@media`.
- **Pedidos HTTP:** `fetch` nativo del navegador, centralizado en `src/servicios/api.js`.
- **Sesión:** el JWT que devuelve el backend se guarda en `localStorage` y se comparte con un contexto de React.

## Cómo correrlo en tu compu

Requisitos: [Node.js](https://nodejs.org) 20.19+ o 22.12+ (lo pide Vite 8; incluye `npm`) y Git.

```bash
git clone https://github.com/bonanno05/BurgaBit-frontend.git
cd BurgaBit-frontend
npm install
```

Crear el archivo `.env` en la raíz del proyecto (se puede copiar `.env.example`):

```
VITE_URL_BACKEND=https://burgabit.onrender.com/api
```

Después:

```bash
npm run dev
```

y abrir http://localhost:5173.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 (se actualiza al guardar) |
| `npm run build` | Arma la versión para publicar en `dist/` |
| `npm run preview` | Sirve la carpeta `dist/` para probar el build |
| `npm run lint` | Revisa el código con ESLint |

### Variables de entorno

| Variable | Ejemplo | Para qué |
|---|---|---|
| `VITE_URL_BACKEND` | `https://burgabit.onrender.com/api` | Dirección de la API. Para usar el backend corriendo en la misma compu: `http://localhost:4000/api` |

Vite escribe el valor dentro del código al hacer el build, así que **no es un secreto** y cualquiera lo puede ver. En el frontend no van claves ni contraseñas.

## Estructura de carpetas

```
BurgaBit-frontend/
├── index.html                 Página única de la SPA (React se monta en <div id="root">)
├── .env.example               Variables de entorno necesarias (copiar a .env)
├── public/                    Archivos que se publican tal cual (favicon)
└── src/
    ├── main.jsx               Punto de entrada: BrowserRouter + proveedor de sesión + App
    ├── App.jsx                Rutas de la app y qué rol puede entrar a cada una
    ├── index.css              Estilos de toda la app
    ├── paginas/               Una pantalla por archivo
    │   ├── Login.jsx
    │   ├── Registro.jsx
    │   ├── ArmarHamburguesa.jsx
    │   ├── MisPedidos.jsx
    │   ├── Cocina.jsx
    │   ├── AdminPedidos.jsx
    │   ├── AdminUsuarios.jsx
    │   ├── AdminCategorias.jsx
    │   └── AdminIngredientes.jsx
    ├── componentes/           Piezas reutilizables
    │   ├── BarraNavegacion.jsx     Links según el rol y cerrar sesión
    │   ├── RutaProtegida.jsx       Deja pasar solo con sesión y con el rol permitido
    │   ├── TarjetaPedido.jsx       Un pedido (lo usan Mis pedidos, Cocina y Pedidos del admin)
    │   ├── SelectorIngrediente.jsx Fila del armado: nombre, precio y − cantidad +
    │   ├── ResumenPedido.jsx       Hamburguesas agregadas, total estimado y confirmar
    │   ├── HistorialEstados.jsx    Quién cambió el estado de un pedido y cuándo
    │   ├── FormularioEmpleado.jsx  Crear cuentas de cocinero o administrador
    │   ├── FormularioCategoria.jsx Crear o editar una categoría
    │   └── FormularioIngrediente.jsx Crear o editar un ingrediente
    ├── contexto/              Sesión compartida
    │   ├── SesionContexto.js       El contexto de React
    │   ├── SesionProveedor.jsx     Guarda el token, lee el rol del JWT, guardar/cerrar sesión
    │   ├── usePedidoConSesion.js   Hook: pedidos con token; cierra la sesión si el backend responde 401
    │   └── inicioSegunRol.js       Pantalla de inicio de cada rol
    ├── servicios/             Comunicación con el backend
    │   ├── api.js                  pedirAlBackend: fetch, token, errores en español
    │   └── authServicio.js         Login y registro
    └── utilidades/
        └── formato.js              Precios y fechas en formato argentino
```

## Cómo se cumple la consigna

| Punto | Dónde |
|---|---|
| SPA responsive | React Router (una sola página) y `index.css` con `@media` |
| Respuesta visual en lo asíncrono | Mensajes de "Cargando…", botones apagados con "Enviando…/Guardando…" mientras esperan, errores del backend en pantalla |
| Solo se comunica con el backend | Todos los datos salen de la API a través de `servicios/api.js` |
| Validaciones antes de enviar | Login, Registro, armado (mínimos, máximos, stock), formularios del admin |
| Sesión con JWT | `contexto/`: token en `localStorage`, rol leído del JWT, rutas protegidas por rol, cierre de sesión si el token vence |
| Desplegado | Render (Static Site) — ver abajo |
| README | Este archivo |

## Deploy

Publicado en **Render** como *Static Site*, conectado a este repositorio: cada `git push` a `main` lo vuelve a publicar.

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Variable de entorno:** `VITE_URL_BACKEND`
- **Regla de Rewrite:** `/*` → `/index.html`, para que funcione recargar (F5) en cualquier pantalla (las rutas las resuelve React Router en el navegador).

## Limitaciones conocidas

- **Mi perfil:** el backend permite cambiar nombre, apellido, foto y contraseña (`PUT /api/auth` y `PUT /api/auth/password`), pero no tiene una ruta para leer los datos del usuario logueado; por eso no hay pantalla de perfil.
- Algunas reglas del backend están repetidas en el frontend para validar antes de enviar (máximo 3 por ingrediente, transiciones de estado, estados de un pedido): si cambian en el backend, hay que cambiarlas acá.
- Los pedidos de la cocina no se actualizan solos: hay un botón "Actualizar".
- No se pueden borrar categorías ni cambiar la categoría de un ingrediente (el backend no lo permite).
- El token se guarda en `localStorage`, que es accesible desde JavaScript; la alternativa más segura (cookies `httpOnly`) requiere cambios en el backend.


## Créditos

- Imagen de la hamburguesa de la pantalla de bienvenida: "Argentine Hamburger with Lettuce and Tomato", de Horacio Cambeiro, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Argentine_Hamburger_with_Lettuce_and_Tomato.png), licencia [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- Fotos de hamburguesas: Ethan Smith y Giorgi Iremadze en [Unsplash](https://unsplash.com), y Pedro Furtado en [Pexels](https://www.pexels.com).
- Capas de la hamburguesa del armador: imagen generada con Gemini (Google) y separada en capas para este proyecto.