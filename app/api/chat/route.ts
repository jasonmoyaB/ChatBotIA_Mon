/**
 * POST /api/chat — la ruta del navegador. `/api/mcp` es la de ChatGPT/Claude.
 *
 * Es solo el orquestador: encadena las comprobaciones en orden y delega cada una
 * en su modulo. Si algo de aqui crece, es que le falta un archivo.
 *
 *   auth -> limite -> entrada -> pre-filtro de alarma -> modelo
 */

import {
  interpretarPeticion,
  PeticionDemasiadoGrande,
} from "@/lib/api/peticion";
import {
  demasiadasPeticiones,
  noAutorizado,
  texto,
} from "@/lib/api/respuestas";
import { leerCookieDeSesion, sesionValida } from "@/lib/auth";
import { consumir } from "@/lib/limite";
import {
  FALTA_MENSAJE,
  MENSAJE_ERROR,
  PETICION_DEMASIADO_GRANDE,
} from "@/lib/mensajes";
import { registrarError } from "@/lib/registro";
import { responderEntrada } from "@/lib/responder";

// Runtime Node, no Edge: el SDK de Anthropic y el streaming largo van aqui.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function responderError(error: unknown): Response {
  if (error instanceof PeticionDemasiadoGrande) {
    return texto(PETICION_DEMASIADO_GRANDE, 413);
  }
  registrarError("error", error);
  return texto(MENSAJE_ERROR, 500);
}

export async function POST(peticion: Request): Promise<Response> {
  try {
    // Se verifica aqui aunque el proxy ya lo haya hecho: si el `matcher` cambia
    // algun dia, esta ruta no puede quedar abierta en silencio.
    const cookie = leerCookieDeSesion(peticion.headers.get("cookie"));
    if (!cookie || !(await sesionValida(cookie))) {
      return noAutorizado();
    }

    const limite = consumir(cookie);
    if (!limite.permitido) {
      return demasiadasPeticiones(limite);
    }

    const entrada = await interpretarPeticion(peticion);
    if (!entrada.mensaje) {
      return texto(FALTA_MENSAJE, 400);
    }

    return responderEntrada(entrada);
  } catch (error) {
    return responderError(error);
  }
}
