"use client";

import { useConversacion } from "@/hooks/use-conversacion";
import { useNuevaConversacion } from "@/hooks/use-nueva-conversacion";

import { Cabecera } from "./cabecera";
import estilos from "./chat.module.css";
import { ConfirmacionNuevaConversacion } from "./confirmacion-nueva-conversacion";
import { Conversacion } from "./conversacion";
import { Redactor } from "./redactor";

/**
 * La pantalla entera. Solo composicion: el estado lo lleva `useConversacion` y
 * cada pieza se ocupa de lo suyo.
 */
export function Chat() {
  const { turnos, enCurso, borrador, escribir, enviar, reiniciar } = useConversacion();
  const nuevaConversacion = useNuevaConversacion(reiniciar);
  return (
    <main className={estilos.pantalla}>
      <Cabecera
        alNuevaConversacion={nuevaConversacion.solicitar}
        deshabilitada={enCurso || turnos.length === 0}
      />
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
      {nuevaConversacion.confirmando ? (
        <ConfirmacionNuevaConversacion
          alCancelar={nuevaConversacion.cancelar}
          alConfirmar={nuevaConversacion.confirmar}
        />
      ) : null}
    </main>
  );
}
