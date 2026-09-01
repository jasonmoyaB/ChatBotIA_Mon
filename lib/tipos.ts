/**
 * Contratos que cruzan la frontera de la red.
 *
 * `Turno` lo escribe el navegador y lo lee la ruta. Tenerlo declarado en los dos
 * lados era pedir que las dos copias divergieran en silencio, sin que el
 * compilador dijera nada: son archivos que no se importan entre si.
 */

export interface Turno {
  role: "user" | "assistant";
  content: string;
}

/** El cuerpo que el navegador envia a POST /api/chat. */
export interface PeticionChat {
  mensaje: string;
  historial: Turno[];
}
