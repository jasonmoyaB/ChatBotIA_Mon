/**
 * Lectura y saneado del cuerpo de POST /api/chat.
 *
 * Nada de lo que llega aqui es de fiar: la cookie prueba que la sesion es valida,
 * no que el JSON tenga la forma esperada. Todo lo que sale de este modulo esta ya
 * recortado y con los tipos comprobados uno a uno.
 */

import type { Turno } from "@/lib/tipos";

const MAX_TURNOS = 20;
const MAX_CARACTERES = 2000;
const MAX_BYTES_PETICION = 50_000;

export class PeticionDemasiadoGrande extends Error {}

export interface EntradaChat {
  mensaje: string;
  historial: Turno[];
}

function esTurno(valor: unknown): valor is Turno {
  if (!valor || typeof valor !== "object") return false;
  const turno = valor as Record<string, unknown>;
  return (
    (turno.role === "user" || turno.role === "assistant") &&
    typeof turno.content === "string"
  );
}

function sanearHistorial(valor: unknown): Turno[] {
  if (!Array.isArray(valor)) return [];
  const esConversacionCompleta = valor.length % 2 === 0;
  const esSecuenciaValida = valor.every(
    (turno, indice) =>
      esTurno(turno) && turno.role === (indice % 2 === 0 ? "user" : "assistant"),
  );
  if (!esConversacionCompleta || !esSecuenciaValida) return [];

  return valor.slice(-MAX_TURNOS).map((turno: Turno) => ({
    role: turno.role,
    content: turno.content.slice(0, MAX_CARACTERES),
  }));
}

async function leerTextoLimitado(peticion: Request): Promise<string> {
  const longitud = Number(peticion.headers.get("content-length"));
  if (longitud > MAX_BYTES_PETICION) throw new PeticionDemasiadoGrande();
  if (!peticion.body) return "";

  const lector = peticion.body.getReader();
  const decodificador = new TextDecoder();
  let bytesLeidos = 0;
  let texto = "";
  for (;;) {
    const { done, value } = await lector.read();
    if (done) return texto + decodificador.decode();
    bytesLeidos += value.byteLength;
    if (bytesLeidos > MAX_BYTES_PETICION) {
      await lector.cancel();
      throw new PeticionDemasiadoGrande();
    }
    texto += decodificador.decode(value, { stream: true });
  }
}

async function leerJsonLimitado(peticion: Request): Promise<unknown> {
  const texto = await leerTextoLimitado(peticion);
  try {
    return JSON.parse(texto);
  } catch {
    return {};
  }
}

export async function interpretarPeticion(
  peticion: Request,
): Promise<EntradaChat> {
  const cuerpo = (await leerJsonLimitado(peticion)) as {
    mensaje?: unknown;
    historial?: unknown;
  };

  return {
    mensaje: String(cuerpo.mensaje ?? "")
      .trim()
      .slice(0, MAX_CARACTERES),
    historial: sanearHistorial(cuerpo.historial),
  };
}
