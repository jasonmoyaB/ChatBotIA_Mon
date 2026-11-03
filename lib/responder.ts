/**
 * Las tres capas que deciden la respuesta, sin auth ni HTTP de entrada.
 *
 *   pre-filtro de alarma -> alcance -> modelo
 *
 * Vive fuera de la ruta porque la comparten `/api/chat` y `/api/mcp`. Un camino
 * de entrada nuevo que no pasara por aqui se saltaria el triage de emergencias.
 */

import { cliente, MODEL_ID } from "@/lib/anthropic/cliente";
import { flujoDeTexto } from "@/lib/anthropic/flujo";
import type { EntradaChat } from "@/lib/api/peticion";
import { texto, transmitir } from "@/lib/api/respuestas";
import { estaDentroDelAlcance } from "@/lib/alcance/evaluar";
import { CONOCIMIENTO } from "@/lib/conocimiento.generado";
import { FUERA_DE_CONTEXTO } from "@/lib/mensajes";
import { construirSystem } from "@/lib/prompt";
import { registrar } from "@/lib/registro";
import { evaluar, type ResultadoTriage } from "@/lib/triage/evaluar";
import { respuestaAlarma } from "@/lib/triage/respuesta";

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

export function responderEntrada(entrada: EntradaChat): Response {
  const triage = evaluar(entrada.mensaje);
  if (triage.esAlarma) return responderAlarma(triage);
  if (!estaDentroDelAlcance(entrada.mensaje, entrada.historial)) {
    registrar("consulta_fuera_de_contexto", { modelo_llamado: false });
    return texto(FUERA_DE_CONTEXTO);
  }
  return responderConModelo(entrada);
}
