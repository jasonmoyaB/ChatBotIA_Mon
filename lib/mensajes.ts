/**
 * Todo lo que llega a leer la cuidadora, en un solo sitio.
 *
 * Estos textos los escribe tanto el servidor (cuerpo de una respuesta HTTP) como
 * el cliente (cuando ni siquiera hay respuesta). Antes vivian duplicados en las
 * dos capas: el mismo aviso de fallo tecnico estaba escrito dos veces, con dos
 * redacciones distintas, y solo una de las dos mencionaba que llamara al medico.
 *
 * Ninguno de estos textos entra en el prompt del modelo. Los que si entran viven
 * en `conocimiento/*.md`.
 */

/** Primera burbuja de la pantalla. No es un turno: no viaja en el historial. */
export const SALUDO =
  "Pregúntame por sus medicamentos, sus comidas o cómo la ves hoy.";

/** El modelo declino responder (`stop_reason: "refusal"`). */
export const MENSAJE_RECHAZO = [
  "No puedo responder a eso.",
  "",
  "Por favor consúltalo directamente con su médico.",
].join("\n");

/**
 * Algo fallo por debajo.
 *
 * Cierra indicando a quien acudir: si el asistente se cae justo cuando ella
 * necesita un dato, dejarla sin salida es el peor final posible.
 */
export const MENSAJE_ERROR = [
  "Ahora mismo no puedo responderte, hubo un problema técnico.",
  "",
  "Si es urgente, llama a su médico o a otro familiar.",
].join("\n");

/** La cookie caduco o se borro. Se resuelve reabriendo el link magico. */
export const SESION_CADUCADA =
  "Tu sesión caducó. Vuelve a abrir el enlace original.";

/** El `fetch` ni siquiera llego a salir. */
export const SIN_CONEXION =
  "No pude conectarme. Revisa tu internet e inténtalo otra vez.";

// Sin tilde a proposito: es el texto que ya estaba desplegado y el que esperan
// las pruebas. Cambiarlo no aporta nada y rompe la comparacion.
export const DEMASIADO_RAPIDO =
  "Vas muy rapido. Espera un momento y vuelve a intentarlo.";

export const FALTA_MENSAJE = "Falta el mensaje.";

export const PETICION_DEMASIADO_GRANDE = "El mensaje es demasiado largo.";

export const FUERA_DE_CONTEXTO =
  "No tengo permitido responder preguntas fuera del cuidado médico de ella.";

export const NO_AUTORIZADO = "No autorizado.";
