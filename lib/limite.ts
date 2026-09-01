/**
 * Limite de peticiones en memoria.
 *
 * Defensa en profundidad, no la puerta principal: la puerta es la cookie de
 * sesion. Esto acota el dano si el link magico se filtra por WhatsApp o queda en
 * una captura, mientras se rota `CLAVE_ACCESO`.
 *
 * El estado vive por instancia de funcion, asi que con varias instancias el
 * limite efectivo es mayor que el nominal. Es aceptable: el corte duro de coste
 * es el limite de gasto del workspace de Anthropic, no esto.
 */

const VENTANA_MS = 60 * 1000;
const MAX_POR_VENTANA = 12;

const ventanas = new Map<string, { desde: number; cuenta: number }>();

export interface ResultadoLimite {
  permitido: boolean;
  /** Segundos que faltan para poder reintentar. Solo util si `permitido` es false. */
  reintentarEnS: number;
}

export function consumir(identidad: string, ahora = Date.now()): ResultadoLimite {
  const ventana = ventanas.get(identidad);

  if (!ventana || ahora - ventana.desde >= VENTANA_MS) {
    ventanas.set(identidad, { desde: ahora, cuenta: 1 });
    // Poda barata: sin esto el Map crece sin limite en una instancia longeva.
    if (ventanas.size > 1000) {
      for (const [k, v] of ventanas) {
        if (ahora - v.desde >= VENTANA_MS) ventanas.delete(k);
      }
    }
    return { permitido: true, reintentarEnS: 0 };
  }

  ventana.cuenta++;
  if (ventana.cuenta > MAX_POR_VENTANA) {
    return {
      permitido: false,
      reintentarEnS: Math.ceil((VENTANA_MS - (ahora - ventana.desde)) / 1000),
    };
  }

  return { permitido: true, reintentarEnS: 0 };
}

/** Vacia el estado. Solo para pruebas. */
export function reiniciarLimite(): void {
  ventanas.clear();
}
