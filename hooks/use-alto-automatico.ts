"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Hace que el textarea crezca con el texto, hasta un tope.
 *
 * Depende del valor y no del evento `change`: asi tambien encoge cuando el
 * campo se vacia desde fuera, al enviarse el mensaje.
 *
 * `useLayoutEffect` y no `useEffect` porque mide y escribe el alto: con
 * `useEffect` el navegador llegaria a pintar un fotograma con el alto viejo.
 */
export function useAltoAutomatico(valor: string, maximoPx = 140) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    nodo.style.height = "auto";
    nodo.style.height = `${Math.min(nodo.scrollHeight, maximoPx)}px`;
  }, [valor, maximoPx]);

  return ref;
}
