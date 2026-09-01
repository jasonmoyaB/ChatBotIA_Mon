import type { Turno } from "@/lib/tipos";
import { PREFIJO_ALARMA } from "@/lib/triage/respuesta";

import estilos from "./chat.module.css";

interface Props {
  turno: Turno;
  /** Turno del bot al que todavia no ha llegado nada de texto. */
  esperando?: boolean;
}

/**
 * Se reconoce una alarma por el prefijo de su primera linea, importado del mismo
 * modulo que la escribe. No es un literal repetido: si el texto cambia alli, esto
 * lo sigue.
 */
function clases(turno: Turno, esperando: boolean): string {
  if (turno.role === "user") {
    return `${estilos.burbuja} ${estilos.yo}`;
  }

  return [
    estilos.burbuja,
    estilos.bot,
    turno.content.startsWith(PREFIJO_ALARMA) ? estilos.alarma : "",
    esperando ? estilos.parpadeo : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Burbuja({ turno, esperando = false }: Props) {
  const autor = turno.role === "user" ? "Tú" : "Asistente";
  return (
    <article className={clases(turno, esperando)} data-turno>
      <span className={estilos.autor}>{autor}</span>
      <div className={estilos.contenido}>
        {esperando ? (
          <span className={estilos.escribiendo} role="status" aria-label="Escribiendo">
            <span />
            <span />
            <span />
          </span>
        ) : turno.content}
      </div>
    </article>
  );
}
