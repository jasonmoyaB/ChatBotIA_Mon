import Anthropic from "@anthropic-ai/sdk";

export const MODEL_ID = process.env.MODEL_ID ?? "claude-sonnet-5";

/**
 * Perezoso a proposito. `new Anthropic()` lanza si falta ANTHROPIC_API_KEY, y a
 * nivel de modulo eso reventaria el build de Next, que importa las rutas para
 * recolectarlas antes de que exista ninguna variable de entorno de runtime.
 */
let instancia: Anthropic | null = null;

export function cliente(): Anthropic {
  instancia ??= new Anthropic();
  return instancia;
}

/**
 * El tipo del stream, derivado del propio cliente.
 *
 * Se deduce en vez de importarse de una ruta interna del SDK (`lib/MessageStream`)
 * para que una reorganizacion de sus archivos no rompa el build.
 */
export type FlujoMensajes = ReturnType<Anthropic["messages"]["stream"]>;
