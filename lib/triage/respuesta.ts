/**
 * La respuesta fija que se devuelve cuando dispara el pre-filtro.
 *
 * Escrita para la cuidadora: quien lee esto no es quien tiene el sintoma. Por eso
 * "no le des" y no "no tomes". Confundir a quien va dirigida una instruccion de
 * este tipo es el fallo que mas caro sale.
 *
 * No menciona ningun medicamento a proposito: el protocolo dice que ante una
 * señal de alarma se contacta al medico, no que se medique.
 *
 * No incluye telefono porque `01_protocolo_emergencias.md` todavia tiene los
 * contactos como plantilla vacia. En cuanto se rellenen, este texto deberia
 * pasar a leerlos del documento.
 */

import type { ResultadoTriage } from "./evaluar";

/**
 * El marcador que usa la interfaz para pintar la burbuja en rojo.
 *
 * Lo importan tanto quien escribe la respuesta como quien la reconoce
 * (`components/chat/burbuja.tsx`). Antes eran dos literales identicos en dos
 * archivos que no se importaban: cambiar uno dejaba el otro sin avisar, y el
 * sintoma habria sido una alarma pintada como una respuesta normal.
 */
export const PREFIJO_ALARMA = "Lo que me cuentas es una señal de alarma";

export function respuestaAlarma(resultado: ResultadoTriage): string {
  const motivos = [...new Set(resultado.senales.map((s) => s.motivo))];

  return [
    `${PREFIJO_ALARMA} y necesita atención médica ahora.`,
    "",
    ...motivos.map((m) => `- ${m}`),
    "",
    "Llama a su médico o llévala a urgencias.",
    "Si no logras contactarlo, llama al número de emergencias o avisa a otro familiar.",
    "",
    "No le des ningún medicamento para esto sin que lo indique el médico.",
  ].join("\n");
}
