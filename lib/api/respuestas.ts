/**
 * Las respuestas HTTP de la ruta del chat.
 *
 * Todo lo que sale es texto plano, incluidos los errores: el cliente hace
 * `respuesta.text()` sin ramificar por content-type, y una respuesta de error no
 * puede exigir un parser que quiza sea justo lo que fallo.
 */

import type { ResultadoLimite } from "@/lib/limite";
import { DEMASIADO_RAPIDO, NO_AUTORIZADO } from "@/lib/mensajes";

const CABECERAS_TEXTO = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

export function texto(
  cuerpo: string,
  status = 200,
  extra: HeadersInit = {},
): Response {
  return new Response(cuerpo, {
    status,
    headers: { ...CABECERAS_TEXTO, ...extra },
  });
}

export function noAutorizado(): Response {
  return texto(NO_AUTORIZADO, 401);
}

export function demasiadasPeticiones(limite: ResultadoLimite): Response {
  return texto(DEMASIADO_RAPIDO, 429, {
    "Retry-After": String(limite.reintentarEnS),
  });
}

export function transmitir(cuerpo: ReadableStream<Uint8Array>): Response {
  return new Response(cuerpo, { status: 200, headers: CABECERAS_TEXTO });
}
