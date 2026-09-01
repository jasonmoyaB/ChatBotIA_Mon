"use client";

import { usarConversacion } from "@/hooks/usar-conversacion";

import { Cabecera } from "./cabecera";
import estilos from "./chat.module.css";
import { Conversacion } from "./conversacion";
import { Redactor } from "./redactor";

/**
 * La pantalla entera. Solo composicion: el estado lo lleva `usarConversacion` y
 * cada pieza se ocupa de lo suyo.
 */
export function Chat() {
  const { turnos, enCurso, borrador, escribir, enviar } = usarConversacion();

  return (
    <main className={estilos.pantalla}>
      <Cabecera />

      <Conversacion turnos={turnos} enCurso={enCurso} />

      <footer className={estilos.pie}>
        <Redactor
          borrador={borrador}
          enCurso={enCurso}
          alEscribir={escribir}
          alEnviar={enviar}
        />
        <p className={estilos.aviso}>Este asistente no sustituye la atención de su médico.</p>
      </footer>
    </main>
  );
}
