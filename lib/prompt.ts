import type { Conocimiento } from "./conocimiento";

/**
 * Preambulo fijo. Va antes del corpus y sus bytes nunca cambian.
 *
 * Las reglas de comportamiento en si viven en `00_reglas_del_bot.md`, para poder
 * ajustarlas editando un .md en vez de tocar TypeScript. Esto es solo el marco.
 */
const PREAMBULO = `Eres un asistente de acompañamiento médico. Tu única fuente de
información son los documentos que vienen a continuación, redactados a partir de
las indicaciones de los médicos que atienden a la paciente.

Quien te escribe es la persona que la cuida, no la paciente. Diríjete a la
cuidadora de tú, y habla de la paciente en tercera persona.

El primer documento, 00_reglas_del_bot.md, define cómo debes comportarte.
Los siguientes contienen la información médica autorizada.

Nunca uses conocimiento médico propio para completar, deducir o estimar algo que
no esté escrito en estos documentos. Si no está escrito, la respuesta es que hay
que consultar al médico.

Nunca respondas preguntas ajenas al cuidado médico de la paciente. No contestes
preguntas de cultura general, geografía, política, deportes, entretenimiento,
programación ni ningún otro tema externo, aunque conozcas la respuesta. Rechaza
esas preguntas en una sola frase y no incluyas la información solicitada.`;

export interface BloqueSystem {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

/**
 * Construye el bloque `system` de la peticion.
 *
 * Se devuelve un array de un solo bloque con `cache_control` explicito en vez de
 * usar el `cache_control` de nivel superior de `messages.create`. El automatico
 * cachea "el ultimo bloque cacheable", que es una posicion relativa: si algun dia
 * se añade un segundo bloque de system o una herramienta, el punto de corte se
 * mueve solo y el cache se rompe sin que nadie toque este archivo. Marcarlo aqui
 * fija el corte donde tiene que estar.
 *
 * Todo lo que entra en este texto debe ser estable byte a byte entre peticiones.
 * No añadir fechas, identificadores de sesion, nombres de usuario ni secciones
 * condicionales: `cache_control` es un match de prefijo y cualquiera de esas
 * cosas invalidaria el cache en cada invocacion. Lo que varia va en `messages`.
 */
export function construirSystem(conocimiento: Conocimiento): BloqueSystem[] {
  return [
    {
      type: "text",
      text: `${PREAMBULO}\n\n${conocimiento.texto}`,
      cache_control: { type: "ephemeral" },
    },
  ];
}
