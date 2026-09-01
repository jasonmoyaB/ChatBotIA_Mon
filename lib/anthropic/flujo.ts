/**
 * Convierte el stream del SDK en un `ReadableStream` de texto plano.
 *
 * El contrato con el navegador es deliberadamente tonto: bytes UTF-8 tal cual,
 * sin SSE ni JSON por linea. El cliente solo tiene que concatenar lo que llega,
 * asi que no hay un parser que pueda desincronizarse a mitad de una respuesta.
 */

import { CONOCIMIENTO } from "@/lib/conocimiento.generado";
import { MENSAJE_ERROR, MENSAJE_RECHAZO } from "@/lib/mensajes";
import { registrar, registrarError } from "@/lib/registro";

import { MODEL_ID, type FlujoMensajes } from "./cliente";

type MensajeFinal = Awaited<ReturnType<FlujoMensajes["finalMessage"]>>;

type Controlador = ReadableStreamDefaultController<Uint8Array>;

const codificador = new TextEncoder();

/**
 * Envuelve el controlador para llevar la cuenta de lo ya emitido.
 *
 * Hace falta fuera del bucle: si el stream revienta a media respuesta, el aviso
 * de error se escribe distinto segun hubiera texto antes o no.
 */
function emisor(controlador: Controlador) {
  let emitido = 0;
  return {
    get emitido() {
      return emitido;
    },
    escribir(texto: string) {
      controlador.enqueue(codificador.encode(texto));
      emitido += texto.length;
    },
  };
}

type Emisor = ReturnType<typeof emisor>;

async function bombear(flujo: FlujoMensajes, salida: Emisor): Promise<void> {
  for await (const parte of flujo) {
    if (
      parte.type === "content_block_delta" &&
      parte.delta.type === "text_delta"
    ) {
      salida.escribir(parte.delta.text);
    }
  }
}

function registrarUso(final: MensajeFinal): void {
  registrar("respuesta_generada", {
    modelo: MODEL_ID,
    documentos: CONOCIMIENTO.documentos,
    stop_reason: final.stop_reason,
    // Si cache_read es 0 de forma sostenida, hay un invalidador en el prefijo
    // del prompt. Ver pruebas/casos_de_prueba.md, caso H1.
    cache_write: final.usage.cache_creation_input_tokens,
    cache_read: final.usage.cache_read_input_tokens,
    tokens_entrada: final.usage.input_tokens,
    tokens_salida: final.usage.output_tokens,
  });
}

async function servir(
  flujo: FlujoMensajes,
  controlador: Controlador,
): Promise<void> {
  const salida = emisor(controlador);
  try {
    await bombear(flujo, salida);
    const final = await flujo.finalMessage();

    // El modelo puede declinar con HTTP 200 y stop_reason "refusal". Sin esta
    // comprobacion la pantalla se quedaria en blanco.
    if (final.stop_reason === "refusal" && salida.emitido === 0) {
      salida.escribir(MENSAJE_RECHAZO);
    }

    registrarUso(final);
  } catch (error) {
    registrarError("error_streaming", error);
    // Las cabeceras ya salieron: no se puede cambiar el status. Lo unico honesto
    // es escribir el aviso dentro del propio texto. Los saltos de linea solo si
    // ya habia texto, para no abrir la burbuja en blanco.
    salida.escribir(
      salida.emitido > 0 ? `\n\n${MENSAJE_ERROR}` : MENSAJE_ERROR,
    );
  } finally {
    controlador.close();
  }
}

export function flujoDeTexto(flujo: FlujoMensajes): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start: (controlador) => servir(flujo, controlador),
    // La usuaria cerro la pestaña: cortar la generacion y dejar de pagarla.
    cancel: () => flujo.abort(),
  });
}
