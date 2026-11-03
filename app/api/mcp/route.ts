/**
 * POST /api/mcp?k=<CLAVE_MCP> — conector para ChatGPT y Claude.
 *
 * El proxy no pasa por aqui (ver `matcher`): su canje de `?k=` redirige, y un
 * cliente MCP no sigue redirecciones con cookies. La puerta es esta.
 *
 *   auth -> limite -> JSON-RPC -> mismo pipeline que /api/chat
 */

import { leerJsonLimitado, PeticionDemasiadoGrande } from "@/lib/api/peticion";
import { demasiadasPeticiones, noAutorizado, texto } from "@/lib/api/respuestas";
import { claveMcpValida } from "@/lib/auth";
import { consumir } from "@/lib/limite";
import { atenderMcp } from "@/lib/mcp";
import { MENSAJE_ERROR, PETICION_DEMASIADO_GRANDE } from "@/lib/mensajes";
import { registrar, registrarError } from "@/lib/registro";
import { responderEntrada } from "@/lib/responder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function preguntar(pregunta: string): Promise<string> {
  registrar("consulta_mcp");
  return responderEntrada({ mensaje: pregunta, historial: [] }).text();
}

export async function POST(peticion: Request): Promise<Response> {
  try {
    if (!claveMcpValida(new URL(peticion.url).searchParams.get("k"))) {
      return noAutorizado();
    }

    const limite = consumir("mcp");
    if (!limite.permitido) return demasiadasPeticiones(limite);

    const respuesta = await atenderMcp(await leerJsonLimitado(peticion), preguntar);
    if (!respuesta) return new Response(null, { status: 202 });
    return Response.json(respuesta, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof PeticionDemasiadoGrande) {
      return texto(PETICION_DEMASIADO_GRANDE, 413);
    }
    registrarError("error_mcp", error);
    return texto(MENSAJE_ERROR, 500);
  }
}

/** Sin stream de servidor a cliente: el spec admite 405. */
export function GET(): Response {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
