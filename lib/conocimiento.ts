/**
 * Formato del corpus medico.
 *
 * Este modulo es deliberadamente puro: no lee disco ni red. La lectura vive en
 * `scripts/generar-conocimiento.ts`, que corre en build y deja el resultado
 * congelado en `lib/conocimiento.generado.ts`. En runtime no hay I/O.
 *
 * El motivo es el cache de prompt. `cache_control` es un match de prefijo por
 * bytes exactos: si el texto se ensamblara en cada invocacion a partir de una
 * lectura (S3, fs, red), cualquier variacion de orden o de contenido cambiaria
 * el prefijo y se pagaria la escritura de cache sin leerla nunca. Fijandolo en
 * build, los bytes no pueden variar entre invocaciones.
 */

export interface Conocimiento {
  /** Los documentos concatenados, listos para el system prompt. */
  texto: string;
  /** Los nombres de archivo en el orden en que se concatenaron. */
  documentos: string[];
}

/**
 * Concatena los documentos en el texto que va al system prompt.
 *
 * Fuente unica del formato: la usan el generador de build y la prueba que
 * comprueba que el archivo generado sigue al dia. Duplicar este formato en dos
 * sitios seria exactamente el tipo de divergencia que rompe el cache sin avisar.
 */
export function ensamblar(claves: string[], cuerpos: string[]): Conocimiento {
  const texto = claves
    .map((clave, i) => `===== ${clave} =====\n\n${cuerpos[i]}`)
    .join("\n\n");
  return { texto, documentos: claves };
}
