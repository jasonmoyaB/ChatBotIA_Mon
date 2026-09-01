import type { Turno } from "@/lib/tipos";
import { normalizarTexto } from "@/lib/texto/normalizar";

import {
  PATRONES_AJENOS,
  PATRONES_DE_SEGUIMIENTO,
  PATRONES_DEL_ASISTENTE,
  PATRONES_MEDICOS,
} from "./patrones";

function coincide(texto: string, patrones: RegExp[]): boolean {
  return patrones.some((patron) => patron.test(texto));
}

function historialMedico(historial: Turno[]): boolean {
  return historial
    .slice(-4)
    .some((turno) => coincide(normalizarTexto(turno.content), PATRONES_MEDICOS));
}

export function estaDentroDelAlcance(
  mensaje: string,
  historial: Turno[],
): boolean {
  const texto = normalizarTexto(mensaje);
  if (coincide(texto, PATRONES_AJENOS)) return false;
  if (coincide(texto, PATRONES_MEDICOS)) return true;
  if (coincide(texto, PATRONES_DEL_ASISTENTE)) return true;
  return coincide(texto, PATRONES_DE_SEGUIMIENTO) && historialMedico(historial);
}
