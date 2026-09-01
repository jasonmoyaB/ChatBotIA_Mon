/**
 * Las frases con las que se prueba el pre-filtro. Datos, no logica.
 *
 * Quien escribe es la cuidadora, no la paciente. Por eso hay dos bloques por
 * cada expectativa: primera persona (como lo escribiria la enferma) y tercera
 * (como lo escribe quien la cuida, que es el uso real). Un patron que solo
 * cubriera la primera dejaria la capa 1 muerta sin que ningun log lo delate.
 */

export const DEBEN_DISPARAR = [
  "tengo fiebre de 38.5",
  "creo que tengo fiebre",
  "mi temperatura es 39",
  "tengo 39 grados",
  "me cuesta respirar",
  "no puedo respirar bien",
  "me falta el aire",
  "me duele el pecho",
  "siento opresion en el pecho",
  "vomito todo lo que tomo",
  "no paro de vomitar",
  "no puedo retener nada",
  "vi heces negras",
  "vomite con sangre",
  "me desmaye esta mañana",
  // El caso crítico: la fiebre manda sobre la náusea.
  "tengo fiebre y muchas nauseas",
  "tengo fiebre y muchas náuseas",
];

export const NO_DEBEN_DISPARAR = [
  "puedo comer arroz?",
  "tengo muchas nauseas",
  "tengo muchas náuseas",
  "me arde el estomago",
  "me siento llena despues de comer",
  "no puedo dormir",
  "estoy ansiosa",
  "puedo tomar acetaminofen?",
  "hola, como estas?",
  // Falsos positivos que un patron de numeros sueltos provocaria.
  "tengo 40 años",
  "tomo 40 mg de algo",
  "tengo 38 años y me siento bien",
];

export const DEBEN_DISPARAR_TERCERA = [
  "tiene fiebre",
  "mi mama tiene fiebre",
  "esta con 39 grados",
  "no puede respirar",
  "le cuesta respirar",
  "le falta el aire",
  "se esta ahogando",
  "le duele el pecho",
  "tiene dolor en el pecho",
  "vomita todo lo que toma",
  "todo lo vomita",
  "no para de vomitar",
  "no deja de vomitar",
  "no retiene nada",
  "devuelve todo",
  "no le queda nada en el estomago",
  "se desmayo",
  "perdio el conocimiento",
  "se quedo inconsciente",
  "tuvo heces negras",
  "vomita sangre",
  // El caso critico, en la voz de quien lo va a escribir.
  "tiene fiebre y muchas nauseas",
];

export const NO_DEBEN_DISPARAR_TERCERA = [
  "puede comer arroz?",
  "tiene muchas nauseas",
  "le arde el estomago",
  "se siente llena despues de comer",
  "no puede dormir",
  "esta muy ansiosa",
  "puede tomar acetaminofen?",
  "tiene 40 años",
  "toma 40 mg de algo",
  "cuanto Enzypride le toca?",
];

/** Las señales del protocolo que tienen que existir si o si. */
export const SENALES_OBLIGATORIAS = [
  "fiebre",
  "respiracion",
  "pecho",
  "vomito_persistente",
];
