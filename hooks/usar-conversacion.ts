"use client";

import { useCallback, useState } from "react";

import type { Turno } from "@/lib/tipos";
import { enviarMensaje } from "@/services/chat";

import { usarTurnos } from "./usar-turnos";

export interface Conversacion {
  turnos: Turno[];
  enCurso: boolean;
  borrador: string;
  escribir: (texto: string) => void;
  enviar: () => void;
}

/**
 * El borrador, el estado del envio y la orquestacion.
 *
 * No conoce `fetch`, ni URLs, ni codigos de estado: eso vive en
 * `services/chat.ts`. La lista de turnos la lleva `usarTurnos`.
 */
export function usarConversacion(): Conversacion {
  const { turnos, abrirIntercambio, reemplazarRespuesta } = usarTurnos();
  const [enCurso, setEnCurso] = useState(false);
  const [borrador, setBorrador] = useState("");

  const enviar = useCallback(() => {
    const mensaje = borrador.trim();
    if (!mensaje || enCurso) return;

    // El historial que se manda es el de ANTES de este mensaje: el mensaje nuevo
    // viaja aparte, en `mensaje`.
    const historial = turnos;

    setBorrador("");
    setEnCurso(true);
    abrirIntercambio(mensaje);

    void enviarMensaje({ mensaje, historial, alRecibir: reemplazarRespuesta })
      .finally(() => setEnCurso(false));
  }, [borrador, enCurso, turnos, abrirIntercambio, reemplazarRespuesta]);

  return { turnos, enCurso, borrador, escribir: setBorrador, enviar };
}
