"use client";

import { useCallback, useRef, useState } from "react";

import type { Turno } from "@/lib/tipos";

export interface TurnoVisible extends Turno {
  id: number;
}

export interface Turnos {
  turnos: TurnoVisible[];
  /** Añade el turno de la cuidadora y abre el del bot, todavia vacio. */
  abrirIntercambio: (mensaje: string) => void;
  /** Reescribe el turno del bot con el texto acumulado hasta ahora. */
  reemplazarRespuesta: (contenido: string) => void;
  borrarTurnos: () => void;
}

/**
 * La lista de turnos y las dos unicas formas en que se modifica.
 *
 * El turno del bot se crea vacio y se va reemplazando en su sitio: asi el texto
 * aparece dentro de la burbuja que ya esta en pantalla, en vez de saltar al
 * final cuando termina.
 */
export function useTurnos(): Turnos {
  const [turnos, setTurnos] = useState<TurnoVisible[]>([]);
  const siguienteId = useRef(0);
  const abrirIntercambio = useCallback((mensaje: string) => {
    const idUsuario = siguienteId.current++;
    const idAsistente = siguienteId.current++;
    setTurnos((previos) => [
      ...previos,
      { id: idUsuario, role: "user", content: mensaje },
      { id: idAsistente, role: "assistant", content: "" },
    ]);
  }, []);

  const reemplazarRespuesta = useCallback((contenido: string) => {
    setTurnos((previos) => {
      const copia = [...previos];
      const ultimo = copia.at(-1);
      if (!ultimo) return previos;
      copia[copia.length - 1] = { ...ultimo, content: contenido };
      return copia;
    });
  }, []);

  const borrarTurnos = useCallback(() => {
    siguienteId.current = 0;
    setTurnos([]);
  }, []);

  return { turnos, abrirIntercambio, reemplazarRespuesta, borrarTurnos };
}
