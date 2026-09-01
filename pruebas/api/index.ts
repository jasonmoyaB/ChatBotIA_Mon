/**
 * Prueba de humo contra la API de Anthropic. Ejecutar con `pnpm probar:api`.
 *
 * No despliega nada. Valida tres cosas de una vez, desde la terminal:
 *
 *   1. La API key sirve.
 *   2. El MODEL_ID existe y es invocable.
 *   3. El prompt caching funciona (cache_read > 0 en la segunda llamada).
 *
 * El punto 3 es el caso H1 de casos_de_prueba.md, que de otro modo solo se
 * podria comprobar despues de desplegar, leyendo los logs de Vercel.
 *
 * Usa el mismo corpus congelado y el mismo `construirSystem()` que la ruta de
 * produccion. El prompt que se prueba aqui es byte a byte el que se enviara.
 */

import Anthropic from "@anthropic-ai/sdk";

import { CONOCIMIENTO } from "../../lib/conocimiento.generado";
import { construirSystem } from "../../lib/prompt";
import { diagnosticar } from "./diagnostico";

const MODEL_ID = process.env.MODEL_ID ?? "claude-sonnet-5";
const raya = "-".repeat(72);

const system = construirSystem(CONOCIMIENTO);

// Perezoso: `new Anthropic()` lanza si falta la API key, y a nivel de modulo eso
// pasaria antes de que `main().catch` pudiera traducir el fallo. Justo el error
// que este archivo existe para explicar.
let instancia: Anthropic | null = null;
function cliente(): Anthropic {
  instancia ??= new Anthropic();
  return instancia;
}

async function llamar(pregunta: string, etiqueta: string) {
  console.log(`\n### ${etiqueta}: "${pregunta}"\n`);

  const respuesta = await cliente().messages.create({
    model: MODEL_ID,
    max_tokens: 1024,
    system,
    thinking: { type: "disabled" },
    messages: [{ role: "user", content: pregunta }],
  });

  const texto = respuesta.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  console.log(texto || "(sin texto)");
  console.log(
    `\n  stop_reason ...... ${respuesta.stop_reason}` +
      `\n  input_tokens ..... ${respuesta.usage.input_tokens}` +
      `\n  output_tokens .... ${respuesta.usage.output_tokens}` +
      `\n  cache_write ...... ${respuesta.usage.cache_creation_input_tokens}` +
      `\n  cache_read ....... ${respuesta.usage.cache_read_input_tokens}`,
  );

  return respuesta;
}

function informarDelCache(cacheRead: number): void {
  if (cacheRead > 0) {
    console.log(`OK  Prompt caching funciona: cache_read = ${cacheRead}`);
    return;
  }
  console.log(
    [
      "AVISO  cache_read = 0 en la segunda llamada.",
      "",
      "El corpus debe superar el minimo cacheable (~1024 tokens) y el prefijo",
      "debe ser identico entre peticiones. Revisa que no haya nada dinamico",
      "(fechas, identificadores) entrando en construirSystem().",
    ].join("\n"),
  );
  process.exitCode = 1;
}

async function main(): Promise<void> {
  console.log(raya);
  console.log(`Modelo:  ${MODEL_ID}`);
  console.log(`Corpus:  ${CONOCIMIENTO.documentos.length} documentos`);
  for (const d of CONOCIMIENTO.documentos) console.log(`         - ${d}`);
  console.log(`         ${system[0]!.text.length} caracteres en el system prompt`);
  console.log(raya);

  // Dos llamadas. El marcador de cache esta en el bloque `system`, que es
  // identico en ambas, asi que la segunda debe leer del cache aunque la
  // pregunta cambie.
  await llamar("Hola, ¿quién eres?", "Llamada 1 (escribe el cache)");
  const segunda = await llamar(
    "tengo muchas nauseas, que puedo tomar?",
    "Llamada 2 (deberia leer del cache)",
  );

  console.log(`\n${raya}`);
  informarDelCache(segunda.usage.cache_read_input_tokens ?? 0);
  console.log(
    "\nRevisa a mano la respuesta de la llamada 2: NO debe dar ninguna dosis.\n" +
      "Debe preguntar cual de los tres antiemeticos le receto el medico antes\n" +
      "de dar nada, y hablar de la paciente en tercera persona.",
  );
  console.log(raya);
}

main().catch((error) => {
  console.error(`\n${raya}`);
  console.error("FALLO\n");
  console.error(diagnosticar(error, MODEL_ID));
  console.error(raya);
  // `process.exit()` mata el proceso con sockets del SDK todavia abiertos, y en
  // Windows eso revienta con "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)"
  // justo despues del mensaje de error. Marcar el codigo deja que Node cierre solo.
  process.exitCode = 1;
});
