/**
 * POST /api/chat — la unica ruta del sistema.
 *
 * Es solo el orquestador: encadena las comprobaciones en orden y delega cada una
 * en su modulo. Si algo de aqui crece, es que le falta un archivo.
 *
 *   auth -> limite -> entrada -> pre-filtro de alarma -> modelo
 */

import { cliente, MODEL_ID } from "@/lib/anthropic/cliente";
import { flujoDeTexto } from "@/lib/anthropic/flujo";
import {
  interpretarPeticion,
  PeticionDemasiadoGrande,
  type EntradaChat,
} from "@/lib/api/peticion";
import {
  demasiadasPeticiones,
  noAutorizado,
  texto,
  transmitir,
} from "@/lib/api/respuestas";
import { leerCookieDeSesion, sesionValida } from "@/lib/auth";
import { estaDentroDelAlcance } from "@/lib/alcance/evaluar";
import { CONOCIMIENTO } from "@/lib/conocimiento.generado";
import { consumir } from "@/lib/limite";
import {
  FALTA_MENSAJE,
  FUERA_DE_CONTEXTO,
  MENSAJE_ERROR,
  PETICION_DEMASIADO_GRANDE,
} from "@/lib/mensajes";
import { construirSystem } from "@/lib/prompt";
import { registrar, registrarError } from "@/lib/registro";
import { evaluar, type ResultadoTriage } from "@/lib/triage/evaluar";
import { respuestaAlarma } from "@/lib/triage/respuesta";

// Runtime Node, no Edge: el SDK de Anthropic y el streaming largo van aqui.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Capa 1: respuesta fija, sin llamar al modelo. Ver lib/triage/. */
function responderAlarma(triage: ResultadoTriage): Response {
  registrar("alarma_detectada", {
    senales: triage.senales.map((s) => s.id),
    modelo_llamado: false,
  });
  return texto(respuestaAlarma(triage));
}

/** Capas 2 y 3: el corpus entero en el system, y el modelo por encima. */
function responderConModelo({ mensaje, historial }: EntradaChat): Response {
  const flujo = cliente().messages.stream({
    model: MODEL_ID,
    max_tokens: 4096,
    // El corpus entero, con el marcador de cache en el bloque.
    system: construirSystem(CONOCIMIENTO),
    thinking: { type: "disabled" },
    messages: [...historial, { role: "user" as const, content: mensaje }],
  });

  return transmitir(flujoDeTexto(flujo));
}

function responderError(error: unknown): Response {
  if (error instanceof PeticionDemasiadoGrande) {
    return texto(PETICION_DEMASIADO_GRANDE, 413);
  }
  registrarError("error", error);
  return texto(MENSAJE_ERROR, 500);
}

function responderEntrada(entrada: EntradaChat): Response {
  const triage = evaluar(entrada.mensaje);
  if (triage.esAlarma) return responderAlarma(triage);
  if (!estaDentroDelAlcance(entrada.mensaje, entrada.historial)) {
    registrar("consulta_fuera_de_contexto", { modelo_llamado: false });
    return texto(FUERA_DE_CONTEXTO);
  }
  return responderConModelo(entrada);
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
