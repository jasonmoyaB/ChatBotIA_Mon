/**
 * Un harness de asserts de veinte lineas.
 *
 * No hay runner de pruebas a proposito: el repo no tiene ninguna dependencia de
 * desarrollo para esto, y lo que se comprueba son funciones puras. Meter un
 * framework serviria para que la salida fuera mas bonita, no para cubrir mas.
 */

let pasadas = 0;
let fallos = 0;

export function comprobar(descripcion: string, condicion: boolean): void {
  if (condicion) {
    pasadas++;
    return;
  }
  fallos++;
  console.error(`  FALLO  ${descripcion}`);
}

export function seccion(titulo: string): void {
  console.log(`\n${titulo}`);
}

/** Imprime el recuento y deja fijado el codigo de salida del proceso. */
export function resumen(): void {
  console.log(`\n${pasadas} pasadas, ${fallos} fallos`);
  process.exitCode = fallos > 0 ? 1 : 0;
}
