"use client";

import { useEffect, useRef } from "react";

/**
 * Mantiene el contenedor pegado a su final cada vez que cambia `dependencia`.
 *
 * Es lo que hace que la conversacion siga al texto mientras va llegando.
 */
export function useDesplazamientoAlFinal<T extends HTMLElement>(
  dependencia: unknown,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const nodo = ref.current;
    if (nodo) nodo.scrollTop = nodo.scrollHeight;
  }, [dependencia]);

  return ref;
}
