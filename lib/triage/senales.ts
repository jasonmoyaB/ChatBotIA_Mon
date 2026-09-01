/**
 * El catalogo de señales de alarma. Datos, no logica.
 *
 * Deriva de `01_protocolo_emergencias.md`. Vive aparte de `evaluar.ts` para que
 * añadir una señal sea editar una lista y nada mas: el motor que la recorre no
 * se toca, asi que no puede romperse al ampliar la cobertura.
 *
 * El balance de errores es deliberado: un falso positivo manda a la cuidadora a
 * llamar al médico sin necesidad, molesto pero inofensivo. Un falso negativo lo
 * sigue cubriendo la capa del modelo, que tiene el protocolo entero en contexto.
 * Por eso los patrones son amplios.
 */

export interface SenalAlarma {
  /** Identificador para logs y pruebas. */
  id: string;
  /** Qué línea del protocolo cubre. */
  motivo: string;
  patron: RegExp;
}

/**
 * Las señales, en primera y en tercera persona.
 *
 * Quien escribe es la cuidadora, no la paciente, asi que los patrones tienen que
 * disparar tanto con "no puedo respirar" como con "no puede respirar". Un patron
 * solo en primera persona deja la capa 1 muerta en silencio: la peticion pasa al
 * modelo como si nada, sin que ningun log lo delate.
 *
 * Por eso las alternancias `(me|le|se)` y `(puedo|puede)` no son adorno. Cada vez
 * que se añada una señal, escribirla en las dos personas.
 */
export const SENALES: SenalAlarma[] = [
  {
    id: "fiebre",
    motivo: "Fiebre superior a 38 °C",
    patron: /\b(fiebre|febril|calentura|destemplada|destemplado)\b/,
  },
  {
    id: "temperatura_alta",
    // Exige la unidad o una palabra de contexto. Sin eso, un número suelto
    // entre 38 y 42 dispararía con "tengo 40 años" o "tomo 40 mg".
    motivo: "Fiebre superior a 38 °C",
    patron:
      /\b(3[89]|4[0-2])([.,]\d)?\s*(grados\b|°|º|c\b)|\b(temperatura|termometro)\b[^.]{0,25}\b(3[89]|4[0-2])([.,]\d)?\b/,
  },
  {
    id: "respiracion",
    motivo: "Dificultad para respirar",
    patron:
      /\b(no (puedo|puede|logro|logra|consigo|consigue) respirar|cuesta respirar|dificultad para respirar|(me|le) falta (el )?aire|falta de aire|(me|se) (esta )?ahog\w*|ahogand\w*|asfixi\w*|sofoc\w*)/,
  },
  {
    id: "pecho",
    motivo: "Dolor en el pecho",
    patron:
      /\b(dolor (en |de )?(el )?pecho|(me|le) duele el pecho|dolor toracico|opresion en el pecho|pecho apretado|presion en el pecho)\b/,
  },
  {
    id: "vomito_persistente",
    motivo: "Vómitos persistentes que impiden la hidratación",
    patron:
      /\b(vomit[oa] todo|lo vomit[oa] todo|todo lo vomit[oa]|no (retengo|retiene|puedo retener|puede retener)|no (paro|para) de vomitar|no (dejo|deja) de vomitar|vomit[oa] sin parar|no (me|le) queda nada|devuelv[oe] todo)\b/,
  },
  {
    id: "sangrado",
    motivo: "Signo de alarma digestivo (nota del Medicamento 8)",
    patron:
      /\b(heces negras|caca negra|popo negro|deposiciones negras|sangre en (el |la )?(vomito|heces|popo|caca)|vomit\w* (con |)sangre|escup\w* sangre|sangrando|sangrado|melena)\b/,
  },
  {
    id: "desmayo",
    motivo: "Pérdida de consciencia",
    patron:
      /\b((me|se) desmay\w*|desmayo|perd(i|io) el conocimiento|(me|se) desvaneci\w*|(se |)quedo inconsciente)\b/,
  },
];
