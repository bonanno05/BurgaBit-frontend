import panAbajo from '../assets/capas/pan-abajo.webp';
import panArriba from '../assets/capas/pan-arriba.webp';
import carne from '../assets/capas/carne.webp';
import queso from '../assets/capas/queso.webp';
import panceta from '../assets/capas/panceta.webp';
import huevo from '../assets/capas/huevo.webp';
import lechuga from '../assets/capas/lechuga.webp';
import pepino from '../assets/capas/pepino.webp';
import tomate from '../assets/capas/tomate.webp';
import cebolla from '../assets/capas/cebolla.webp';

// Dibuja la hamburguesa con una foto por capa, apiladas de abajo hacia arriba.
// Props:
//   ingredientes: lista de { nombre, cantidad } con lo que lleva la hamburguesa.
//   chica: true para la versión chiquita (resumen del celular, tarjetas de pedido).

const IMAGENES = {
  carne: carne,
  queso: queso,
  panceta: panceta,
  huevo: huevo,
  lechuga: lechuga,
  pepino: pepino,
  tomate: tomate,
  cebolla: cebolla,
};

// Qué capa le corresponde a cada ingrediente, según palabras de su nombre.
// El backend no guarda imágenes, por eso se decide por el nombre.
// Si un ingrediente no coincide con ninguna, no se dibuja (igual aparece en la lista de texto).
const PALABRAS_POR_CAPA = [
  { tipo: 'panceta', palabras: ['panceta', 'bacon', 'tocino'] },
  { tipo: 'carne', palabras: ['medallon', 'medallón', 'carne', 'hamburguesa'] },
  { tipo: 'queso', palabras: ['queso', 'cheddar', 'dambo', 'provoleta', 'mozzarella', 'tybo'] },
  { tipo: 'huevo', palabras: ['huevo'] },
  { tipo: 'lechuga', palabras: ['lechuga', 'rucula', 'rúcula'] },
  { tipo: 'pepino', palabras: ['pepino', 'pickle'] },
  { tipo: 'tomate', palabras: ['tomate'] },
  { tipo: 'cebolla', palabras: ['cebolla'] },
];

// Orden de las capas de abajo hacia arriba (la carne y el queso se intercalan aparte).
const ORDEN = ['panceta', 'huevo', 'lechuga', 'pepino', 'tomate', 'cebolla'];

function tipoDeCapa(nombre) {
  const nombreEnMinuscula = nombre.toLowerCase();
  for (const grupo of PALABRAS_POR_CAPA) {
    for (const palabra of grupo.palabras) {
      if (nombreEnMinuscula.includes(palabra)) {
        return grupo.tipo;
      }
    }
  }
  return null;
}

// Devuelve la lista de capas a dibujar, de abajo hacia arriba.
// Cada unidad es una capa: 2 medallones son 2 capas de carne.
// La "clave" no cambia entre dibujos, así React solo anima la capa nueva.
function armarCapas(ingredientes) {
  const cantidadPorTipo = {};
  for (const ingrediente of ingredientes) {
    const tipo = tipoDeCapa(ingrediente.nombre);
    if (tipo !== null) {
      let anterior = 0;
      if (cantidadPorTipo[tipo] !== undefined) {
        anterior = cantidadPorTipo[tipo];
      }
      cantidadPorTipo[tipo] = anterior + ingrediente.cantidad;
    }
  }

  function cantidadDe(tipo) {
    if (cantidadPorTipo[tipo] === undefined) {
      return 0;
    }
    return cantidadPorTipo[tipo];
  }

  const capas = [];

  // Carne y queso intercalados, como una hamburguesa doble de verdad.
  const carnes = cantidadDe('carne');
  const quesos = cantidadDe('queso');
  const vueltas = Math.max(carnes, quesos);
  for (let numero = 0; numero < vueltas; numero++) {
    if (numero < carnes) {
      capas.push({ tipo: 'carne', clave: 'carne-' + numero });
    }
    if (numero < quesos) {
      capas.push({ tipo: 'queso', clave: 'queso-' + numero });
    }
  }

  for (const tipo of ORDEN) {
    for (let numero = 0; numero < cantidadDe(tipo); numero++) {
      capas.push({ tipo: tipo, clave: tipo + '-' + numero });
    }
  }

  return capas;
}

function DibujoHamburguesa(props) {
  const capas = armarCapas(props.ingredientes);

  let clases = 'hamburguesa';
  if (props.chica === true) {
    clases = 'hamburguesa hamburguesa-chica';
  }

  // aria-hidden: es un dibujo decorativo; lo que lleva ya está escrito en texto al lado.
  return (
    <div className={clases} aria-hidden="true">
      <img className="capa-pan-abajo" src={panAbajo} alt="" />

      {capas.map(function (capa, posicion) {
        return (
          <img
            key={capa.clave}
            className={'capa capa-' + capa.tipo}
            src={IMAGENES[capa.tipo]}
            alt=""
            style={{ zIndex: posicion + 2 }}
          />
        );
      })}

      <img className="capa-pan-arriba" src={panArriba} alt="" style={{ zIndex: capas.length + 2 }} />
    </div>
  );
}

export default DibujoHamburguesa;
