"use client";

import { usarDesplazamientoAlFinal } from "@/hooks/usar-desplazamiento-al-final";
import { usarAnimacionDeTurnos } from "@/hooks/usar-animacion-de-turnos";
import { SALUDO } from "@/lib/mensajes";
import type { Turno } from "@/lib/tipos";

import { Burbuja } from "./burbuja";
import estilos from "./chat.module.css";

interface Props {
  turnos: Turno[];
  enCurso: boolean;
}

// No es un turno: no viaja en el historial ni cuenta para el modelo.
const BURBUJA_SALUDO: Turno = { role: "assistant", content: SALUDO };

export function Conversacion({ turnos, enCurso }: Props) {
  const contenedor = usarDesplazamientoAlFinal<HTMLDivElement>(turnos);
  usarAnimacionDeTurnos(contenedor, turnos.length);
  const ultimo = turnos.length - 1;

  return (
    <div
      className={estilos.conversacion}
      ref={contenedor}
      aria-live="polite"
      aria-atomic="false"
      aria-label="Conversación"
    >
      <Burbuja turno={BURBUJA_SALUDO} />

      {turnos.map((turno, i) => (
        <Burbuja
          key={`${i}-${turno.role}`}
          turno={turno}
          esperando={enCurso && i === ultimo && !turno.content}
        />
      ))}
    </div>
  );
}
