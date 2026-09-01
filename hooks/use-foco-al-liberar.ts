"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Devuelve el foco al elemento cuando deja de estar ocupado.
 *
 * El textarea se deshabilita mientras llega la respuesta, y deshabilitarlo le
 * quita el foco. Sin esto, la cuidadora tendria que volver a tocar el campo
 * despues de cada mensaje.
 */
export function useFocoAlLiberar(
  ref: RefObject<HTMLElement | null>,
  ocupado: boolean,
): void {
  const estuvoOcupado = useRef(false);

  useEffect(() => {
    if (ocupado) {
      estuvoOcupado.current = true;
      return;
    }
    // Solo despues de haberse ocupado: en el primer render robar el foco abriria
    // el teclado del movil nada mas entrar.
    if (estuvoOcupado.current) {
      estuvoOcupado.current = false;
      ref.current?.focus();
    }
  }, [ocupado, ref]);
}
