/**
 * El corpus: orden determinista y modulo congelado al dia.
 *
 * Son las dos cosas que fallarian en silencio. Un orden distinto entre la
 * maquina de desarrollo y el build de Vercel rompe el cache del prompt sin dar
 * ningun error; un .md editado sin ejecutar `pnpm generar` deja produccion
 * sirviendo el texto viejo.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CONOCIMIENTO } from "../../lib/conocimiento.generado";
import {
  leerDeDisco,
  renderizarModulo,
} from "../../scripts/generar-conocimiento";
import { comprobar, seccion } from "./ejecutor";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const ESPERADOS = [
  "00_reglas_del_bot.md",
  "01_protocolo_emergencias.md",
  "02_medicamentos_no_autorizados.md",
  "03_medicamentos_autorizados.md",
  "04_mapa_sintomas_medicamentos.md",
  "05_reglas_alimentacion.md",
];

function leerDocumentos(): string[] {
  return readdirSync(join(RAIZ, "conocimiento")).filter((f) => f.endsWith(".md"));
}

function pruebasDeOrden(): void {
  seccion("Corpus: orden determinista");

  const documentos = leerDocumentos();
  comprobar(
    `hay ${ESPERADOS.length} documentos (encontrados: ${documentos.length})`,
    documentos.length === ESPERADOS.length,
  );

  const ordenados = [...documentos].sort();
  comprobar(
    `el orden es el esperado: ${ordenados.join(", ")}`,
    JSON.stringify(ordenados) === JSON.stringify(ESPERADOS),
  );

  // El mismo array desordenado de mil formas debe converger al mismo orden.
  const converge = Array.from({ length: 50 }).every(() => {
    const barajado = [...documentos].sort(() => Math.random() - 0.5);
    return JSON.stringify([...barajado].sort()) === JSON.stringify(ordenados);
  });
  comprobar("el sort converge desde cualquier orden de entrada", converge);
}

/** Los documentos criticos tienen que caer al principio del contexto. */
function pruebasDePrioridad(): void {
  seccion("Corpus: prioridad dentro del contexto");

  const ordenados = leerDocumentos().sort();
  comprobar(
    "las reglas del bot van primero",
    ordenados[0] === "00_reglas_del_bot.md",
  );
  comprobar(
    "el protocolo de emergencias va antes que los medicamentos",
    ordenados.indexOf("01_protocolo_emergencias.md") <
      ordenados.indexOf("03_medicamentos_autorizados.md"),
  );
  comprobar(
    "la lista de bloqueo va antes que la de autorizados",
    ordenados.indexOf("02_medicamentos_no_autorizados.md") <
      ordenados.indexOf("03_medicamentos_autorizados.md"),
  );
}

/**
 * Si alguien edita un .md y no ejecuta `pnpm generar`, produccion seguiria
 * sirviendo el texto viejo sin que nada avise. Tiene que fallar aqui.
 */
function pruebasDeSincronia(): void {
  seccion("Corpus: el modulo congelado esta al dia");

  const enDisco = leerDeDisco();
  comprobar(
    "lib/conocimiento.generado.ts coincide con conocimiento/*.md",
    enDisco.texto === CONOCIMIENTO.texto,
  );
  comprobar(
    "la lista de documentos coincide",
    JSON.stringify(enDisco.documentos) ===
      JSON.stringify(CONOCIMIENTO.documentos),
  );

  // Comparacion normalizando saltos de linea: en Windows el archivo puede quedar
  // con CRLF y eso no es una divergencia real de contenido.
  const saltos = /\r\n/g;
  const generado = readFileSync(
    join(RAIZ, "lib", "conocimiento.generado.ts"),
    "utf-8",
  );
  comprobar(
    "el archivo generado es byte a byte lo que produce el generador",
    generado.replace(saltos, "\n") ===
      renderizarModulo(enDisco).replace(saltos, "\n"),
  );
}

function pruebasDeContenido(): void {
  seccion("Corpus: contenido minimo");

  // El minimo cacheable de la API ronda los 1024 tokens. Por debajo, el bloque
  // `system` no se cachea y cada peticion se paga entera.
  comprobar(
    `el corpus supera el minimo cacheable (${CONOCIMIENTO.texto.length} caracteres)`,
    CONOCIMIENTO.texto.length > 4000,
  );
  comprobar(
    "el protocolo de emergencias esta dentro del contexto",
    CONOCIMIENTO.texto.includes("SÍNTOMAS DE ALARMA"),
  );
  comprobar(
    "la lista de bloqueo esta dentro del contexto",
    CONOCIMIENTO.texto.includes("MEDICAMENTOS NO AUTORIZADOS"),
  );
}

export function pruebasDelCorpus(): void {
  pruebasDeOrden();
  pruebasDePrioridad();
  pruebasDeSincronia();
  pruebasDeContenido();
}
