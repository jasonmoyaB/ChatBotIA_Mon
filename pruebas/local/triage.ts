import { normalizarTexto } from "../../lib/texto/normalizar";
import { evaluar } from "../../lib/triage/evaluar";
import { PREFIJO_ALARMA, respuestaAlarma } from "../../lib/triage/respuesta";
import { SENALES } from "../../lib/triage/senales";
import {
  DEBEN_DISPARAR,
  DEBEN_DISPARAR_TERCERA,
  NO_DEBEN_DISPARAR,
  NO_DEBEN_DISPARAR_TERCERA,
  SENALES_OBLIGATORIAS,
} from "./casos-triage";
import { comprobar, seccion } from "./ejecutor";

function esperarAlarma(frases: string[]): void {
  for (const frase of frases) {
    comprobar(`"${frase}" deberia disparar`, evaluar(frase).esAlarma);
  }
}

function esperarSilencio(frases: string[]): void {
  for (const frase of frases) {
    const resultado = evaluar(frase);
    const disparo = resultado.senales.map((s) => s.id).join(", ");
    comprobar(
      `"${frase}" NO deberia disparar (disparo: ${disparo})`,
      !resultado.esAlarma,
    );
  }
}

export function pruebasDelTriage(): void {
  seccion("Pre-filtro: DEBE disparar");
  esperarAlarma(DEBEN_DISPARAR);

  seccion("Pre-filtro: NO debe disparar");
  esperarSilencio(NO_DEBEN_DISPARAR);

  seccion("Pre-filtro: DEBE disparar en tercera persona (habla la cuidadora)");
  esperarAlarma(DEBEN_DISPARAR_TERCERA);

  seccion("Pre-filtro: NO debe disparar en tercera persona");
  esperarSilencio(NO_DEBEN_DISPARAR_TERCERA);

  seccion("Pre-filtro: normalizacion de acentos");
  comprobar("quita acentos", normalizarTexto("NÁUSEAS Ó Ü") === "nauseas o u");
  comprobar(
    "acentuado y sin acentuar dan el mismo resultado",
    evaluar("me desmayé").esAlarma === evaluar("me desmaye").esAlarma,
  );

  seccion("Pre-filtro: cobertura del protocolo");
  for (const id of SENALES_OBLIGATORIAS) {
    comprobar(
      `existe una senal para "${id}"`,
      SENALES.some((s) => s.id === id),
    );
  }
}

/**
 * El contrato entre la respuesta de alarma y la interfaz.
 *
 * `components/chat/burbuja.tsx` pinta la burbuja en rojo comparando el texto con
 * `PREFIJO_ALARMA`. Si la primera linea dejara de empezar por ahi, una urgencia
 * se veria como una respuesta cualquiera y nada mas lo delataria.
 */
export function pruebasDeRespuestaAlarma(): void {
  seccion("Alarma: la respuesta conserva el marcador de la interfaz");

  const resultado = evaluar("tiene fiebre y muchas nauseas");
  const texto = respuestaAlarma(resultado);

  comprobar("la respuesta empieza por el prefijo", texto.startsWith(PREFIJO_ALARMA));
  comprobar(
    "la primera linea es la esperada",
    texto.split("\n")[0] ===
      "Lo que me cuentas es una señal de alarma y necesita atención médica ahora.",
  );
  comprobar(
    "no menciona ningun medicamento",
    !/metoclopramida|ondansetron|domperidona|paracetamol/i.test(texto),
  );
  comprobar(
    "manda a urgencias",
    texto.includes("urgencias") && texto.includes("médico"),
  );
}
