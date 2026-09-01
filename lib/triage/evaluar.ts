/**
 * Pre-filtro determinista de señales de alarma.
 *
 * Se ejecuta ANTES de llamar al modelo: si dispara, se devuelve una respuesta
 * fija y no se invoca a la API.
 *
 * Es estrictamente aditivo. Si no dispara, la petición sigue el camino normal,
 * donde el modelo igualmente tiene el protocolo de emergencias completo en
 * contexto. Nunca puede hacer que el sistema sea menos seguro que sin él.
 */

import { normalizarTexto } from "@/lib/texto/normalizar";

import { SENALES, type SenalAlarma } from "./senales";

export interface ResultadoTriage {
  esAlarma: boolean;
  senales: SenalAlarma[];
}

export function evaluar(mensaje: string): ResultadoTriage {
  const texto = normalizarTexto(mensaje);
  const senales = SENALES.filter((s) => s.patron.test(texto));
  return { esAlarma: senales.length > 0, senales };
}
