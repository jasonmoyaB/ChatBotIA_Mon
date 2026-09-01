"use client";

import { useCallback, useState } from "react";

import type { Turno } from "@/lib/tipos";

export interface Turnos {
  turnos: Turno[];
  /** Añade el turno de la cuidadora y abre el del bot, todavia vacio. */
  abrirIntercambio: (mensaje: string) => void;
  /** Reescribe el turno del bot con el texto acumulado hasta ahora. */
  reemplazarRespuesta: (contenido: string) => void;
}

/**
 * La lista de turnos y las dos unicas formas en que se modifica.
 *
 * El turno del bot se crea vacio y se va reemplazando en su sitio: asi el texto
 * aparece dentro de la burbuja que ya esta en pantalla, en vez de saltar al
 * final cuando termina.
 */
export function usarTurnos(): Turnos {
  const [turnos, setTurnos] = useState<Turno[]>([]);

  const abrirIntercambio = useCallback((mensaje: string) => {
    setTurnos((previos) => [
      ...previos,
      { role: "user", content: mensaje },
      { role: "assistant", content: "" },
    ]);
  }, []);

  const reemplazarRespuesta = useCallback((contenido: string) => {
    setTurnos((previos) => {
      const copia = [...previos];
      copia[copia.length - 1] = { role: "assistant", content: contenido };
      return copia;
    });
  }, []);

  return { turnos, abrirIntercambio, reemplazarRespuesta };
}
