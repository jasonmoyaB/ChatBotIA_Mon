/**
 * Congela `conocimiento/*.md` en un modulo TypeScript.
 *
 * Corre en `prebuild` y en `predev`, asi que Vercel lo regenera en cada deploy:
 * actualizar un documento medico sigue siendo editar el .md y hacer git push.
 *
 * El `sort()` no es cosmetico. Se usa el orden por defecto (unidades de codigo
 * UTF-16), no `localeCompare`, que depende de la configuracion regional y no es
 * reproducible entre la maquina de desarrollo y el build de Vercel. El prefijo
 * numerico de los archivos garantiza ademas que las reglas del bot, el protocolo
 * de emergencias y la lista de bloqueo queden al principio del contexto.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ensamblar, type Conocimiento } from "../lib/conocimiento";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const DIR_CONOCIMIENTO = join(RAIZ, "conocimiento");
const DESTINO = join(RAIZ, "lib", "conocimiento.generado.ts");

/** Lee y ensambla el corpus desde el disco. La reutiliza `pruebas/local/corpus.ts`. */
export function leerDeDisco(): Conocimiento {
  const claves = readdirSync(DIR_CONOCIMIENTO)
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (claves.length === 0) {
    throw new Error(`No hay documentos .md en ${DIR_CONOCIMIENTO}`);
  }

  const cuerpos = claves.map((clave) =>
    readFileSync(join(DIR_CONOCIMIENTO, clave), "utf-8").trim(),
  );

  return ensamblar(claves, cuerpos);
}

export function renderizarModulo(conocimiento: Conocimiento): string {
  return [
    "// GENERADO POR scripts/generar-conocimiento.ts — NO EDITAR A MANO.",
    "// Para cambiar el contenido, edita conocimiento/*.md y ejecuta `pnpm generar`.",
    "//",
    "// Estos bytes son el prefijo cacheado del prompt. Cualquier cosa que los",
    "// haga variar entre invocaciones invalida el cache en cada peticion.",
    "",
    'import type { Conocimiento } from "./conocimiento";',
    "",
    "export const CONOCIMIENTO: Conocimiento = {",
    `  texto: ${JSON.stringify(conocimiento.texto)},`,
    `  documentos: ${JSON.stringify(conocimiento.documentos)},`,
    "};",
    "",
  ].join("\n");
}

// Solo escribe cuando se ejecuta como script; importarlo desde las pruebas no
// toca el disco.
const esEjecutadoDirectamente =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (esEjecutadoDirectamente) {
  const conocimiento = leerDeDisco();
  writeFileSync(DESTINO, renderizarModulo(conocimiento), "utf-8");
  console.log(
    `Corpus congelado: ${conocimiento.documentos.length} documentos, ` +
      `${conocimiento.texto.length} caracteres`,
  );
  for (const doc of conocimiento.documentos) console.log(`  - ${doc}`);
}
