/**
 * Registro estructurado.
 *
 * Una linea de JSON por evento, con `evento` siempre primero. Es lo que Vercel
 * indexa, y permite filtrar por tipo de evento sin escribir una expresion
 * regular sobre texto libre.
 */

type Datos = Record<string, unknown>;

export function registrar(evento: string, datos: Datos = {}): void {
  console.log(JSON.stringify({ evento, ...datos }));
}

export function registrarError(evento: string, error: unknown): void {
  console.error(
    JSON.stringify({
      evento,
      mensaje: error instanceof Error ? error.message : String(error),
    }),
  );
}
