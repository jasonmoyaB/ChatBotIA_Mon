/**
 * El unico modulo que sabe que existe `/api/chat`.
 *
 * Ni estado ni React. Recibe el mensaje y devuelve el texto por trozos a traves
 * de `alRecibir`, para que quien llame decida que hacer con el. Asi la pantalla
 * no tiene que saber nada de HTTP, ni de codigos de estado, ni de streams.
 */

import { MENSAJE_ERROR, SESION_CADUCADA, SIN_CONEXION } from "@/lib/mensajes";
import type { Turno } from "@/lib/tipos";

const RUTA = "/api/chat";

export interface Envio {
  mensaje: string;
  /** El historial ANTERIOR a `mensaje`. El mensaje nuevo viaja aparte. */
  historial: Turno[];
  /** Se llama con el texto acumulado, no con el trozo suelto. */
  alRecibir: (texto: string) => void;
}

async function leerHastaElFinal(
  cuerpo: ReadableStream<Uint8Array>,
  alRecibir: Envio["alRecibir"],
): Promise<void> {
  const lector = cuerpo.getReader();
  const decodificador = new TextDecoder();
  let texto = "";

  for (;;) {
    const { done, value } = await lector.read();
    if (done) return;
    texto += decodificador.decode(value, { stream: true });
    alRecibir(texto);
  }
}

export async function enviarMensaje({
  mensaje,
  historial,
  alRecibir,
}: Envio): Promise<void> {
  try {
    const respuesta = await fetch(RUTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje, historial }),
    });

    if (respuesta.status === 401) {
      alRecibir(SESION_CADUCADA);
      return;
    }

    if (!respuesta.ok || !respuesta.body) {
      alRecibir((await respuesta.text()) || MENSAJE_ERROR);
      return;
    }

    await leerHastaElFinal(respuesta.body, alRecibir);
  } catch {
    // El `fetch` no llego a salir, o el stream se corto. En ambos casos lo unico
    // que sabe la usuaria es que no hay respuesta: no se le detalla mas.
    alRecibir(SIN_CONEXION);
  }
}
