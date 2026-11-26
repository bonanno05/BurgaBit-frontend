import { useState, useEffect } from 'react';

// Aviso que aparece solo si una espera dura más de 3 segundos.
// El backend está en el plan gratis de Render: se apaga cuando nadie lo usa
// y el primer pedido lo tiene que "despertar", lo que puede tardar hasta un minuto.
// Si la respuesta llega rápido, el aviso nunca se ve.
function AvisoDemora() {
  const [tardando, setTardando] = useState(false);

  useEffect(function () {
    const temporizador = setTimeout(function () {
      setTardando(true);
    }, 3000);

    // Si la espera termina antes de los 3 segundos, el componente desaparece
    // y esta función de limpieza cancela el temporizador.
    return function () {
      clearTimeout(temporizador);
    };
  }, []);

  if (tardando === false) {
    return null;
  }

  return (
    <p className="aviso-demora">
      Está tardando más de lo normal, servidor despertándose.
    </p>
  );
}

export default AvisoDemora;