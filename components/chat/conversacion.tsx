"use client";

import { useDesplazamientoAlFinal } from "@/hooks/use-desplazamiento-al-final";
import { useAnimacionDeTurnos } from "@/hooks/use-animacion-de-turnos";
import type { TurnoVisible } from "@/hooks/use-turnos";
import { SALUDO } from "@/lib/mensajes";
import type { Turno } from "@/lib/tipos";

import { Burbuja } from "./burbuja";
import estilos from "./chat.module.css";

interface Props {
  turnos: TurnoVisible[];
  enCurso: boolean;
}

// No es un turno: no viaja en el historial ni cuenta para el modelo.
const BURBUJA_SALUDO: Turno = { role: "assistant", content: SALUDO };

export function Conversacion({ turnos, enCurso }: Props) {
  const contenedor = useDesplazamientoAlFinal<HTMLDivElement>(turnos);
  useAnimacionDeTurnos(contenedor, turnos.length);
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
          key={turno.id}
          turno={turno}
          esperando={enCurso && i === ultimo && !turno.content}
        />
      ))}
    </div>
  );
}
