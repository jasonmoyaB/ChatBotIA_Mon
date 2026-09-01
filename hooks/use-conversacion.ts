"use client";

import { useCallback, useState } from "react";

import { enviarMensaje } from "@/services/chat";

import { useTurnos, type TurnoVisible } from "./use-turnos";

export interface Conversacion {
  turnos: TurnoVisible[];
  enCurso: boolean;
  borrador: string;
  escribir: (texto: string) => void;
  enviar: () => void;
  reiniciar: () => void;
}

/**
 * El borrador, el estado del envio y la orquestacion.
 *
 * No conoce `fetch`, ni URLs, ni codigos de estado: eso vive en
 * `services/chat.ts`. La lista de turnos la lleva `useTurnos`.
 */
export function useConversacion(): Conversacion {
  const { turnos, abrirIntercambio, reemplazarRespuesta, borrarTurnos } = useTurnos();
  const [enCurso, setEnCurso] = useState(false);
  const [borrador, setBorrador] = useState("");

  const enviar = useCallback(() => {
    const mensaje = borrador.trim();
    if (!mensaje || enCurso) return;

    // El historial que se manda es el de ANTES de este mensaje: el mensaje nuevo
    // viaja aparte, en `mensaje`.
    const historial = turnos.map(({ role, content }) => ({ role, content }));

    setBorrador("");
    setEnCurso(true);
    abrirIntercambio(mensaje);

    void enviarMensaje({ mensaje, historial, alRecibir: reemplazarRespuesta })
      .finally(() => setEnCurso(false));
  }, [borrador, enCurso, turnos, abrirIntercambio, reemplazarRespuesta]);

  const reiniciar = useCallback(() => {
    if (enCurso) return;
    setBorrador("");
    borrarTurnos();
  }, [borrarTurnos, enCurso]);

  return { turnos, enCurso, borrador, escribir: setBorrador, enviar, reiniciar };
}
