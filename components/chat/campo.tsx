"use client";

import type { KeyboardEvent } from "react";

import { useAltoAutomatico } from "@/hooks/use-alto-automatico";
import { useFocoAlLiberar } from "@/hooks/use-foco-al-liberar";

import estilos from "./chat.module.css";

interface Props {
  valor: string;
  ocupado: boolean;
  alEscribir: (texto: string) => void;
  alEnviar: () => void;
}

/** Enter envia; Shift+Enter hace salto de linea. */
function atajoDeEnvio(alEnviar: () => void) {
  return (evento: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      alEnviar();
    }
  };
}

/** El textarea: crece con el texto y recupera el foco al quedar libre. */
export function Campo({ valor, ocupado, alEscribir, alEnviar }: Props) {
  const entrada = useAltoAutomatico(valor);
  useFocoAlLiberar(entrada, ocupado);

  return (
    <>
      <label htmlFor="entrada" className={estilos.soloLectores}>
        Escribe tu mensaje
      </label>
      <textarea
        id="entrada"
        ref={entrada}
        className={estilos.entrada}
        rows={1}
        placeholder="Pregunta por un medicamento o síntoma"
        autoComplete="off"
        value={valor}
        disabled={ocupado}
        onChange={(e) => alEscribir(e.target.value)}
        onKeyDown={atajoDeEnvio(alEnviar)}
      />
    </>
  );
}
