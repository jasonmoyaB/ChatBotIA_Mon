/**
 * Sesion por cookie firmada.
 *
 * El modelo de acceso es un link magico: se le manda a la cuidadora una URL con
 * `?k=<CLAVE_ACCESO>` una sola vez. El proxy canjea ese token por una cookie
 * httpOnly firmada y redirige a `/` para que el token no quede en el historial ni
 * en una captura de pantalla. A partir de ahi ella abre el icono y entra.
 *
 * Se usa Web Crypto (no `node:crypto`) porque el proxy corre en el runtime
 * Edge, donde `node:crypto` no existe.
 */

export const COOKIE_SESION = "sesion";
export const DURACION_SESION_S = 60 * 60 * 24 * 365; // 1 año

const codificador = new TextEncoder();

function requerir(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}

/**
 * Comparacion en tiempo constante.
 *
 * Un `===` sobre secretos filtra por temporizacion cuantos caracteres del
 * principio coinciden, lo que permite adivinar el token byte a byte. La longitud
 * si se filtra, y no importa: la clave es de longitud fija y conocida.
 */
function igualesEnTiempoConstante(a: string, b: string): boolean {
  const ba = codificador.encode(a);
  const bb = codificador.encode(b);
  if (ba.length !== bb.length) return false;
  let diferencia = 0;
  for (let i = 0; i < ba.length; i++) diferencia |= ba[i]! ^ bb[i]!;
  return diferencia === 0;
}

async function clave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    codificador.encode(requerir("SECRETO_COOKIE")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function aBase64Url(bytes: ArrayBuffer): string {
  const binario = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** `true` si el token del link magico es el correcto. */
export function claveDeAccesoValida(entregada: string | null): boolean {
  if (!entregada) return false;
  return igualesEnTiempoConstante(entregada, requerir("CLAVE_ACCESO"));
}

/**
 * Genera el valor de la cookie: `<emitidaEn>.<hmac>`.
 *
 * Lleva la marca de tiempo dentro de la firma para que la sesion pueda caducar
 * del lado del servidor aunque el navegador conserve la cookie.
 */
export async function firmarSesion(ahora = Date.now()): Promise<string> {
  const emitidaEn = String(Math.floor(ahora / 1000));
  const firma = await crypto.subtle.sign(
    "HMAC",
    await clave(),
    codificador.encode(emitidaEn),
  );
  return `${emitidaEn}.${aBase64Url(firma)}`;
}

/** Verifica firma y antiguedad de la cookie. */
export async function sesionValida(
  valor: string | undefined,
  ahora = Date.now(),
): Promise<boolean> {
  if (!valor) return false;

  const separador = valor.lastIndexOf(".");
  if (separador <= 0) return false;

  const emitidaEn = valor.slice(0, separador);
  if (!/^\d+$/.test(emitidaEn)) return false;

  const esperada = await crypto.subtle.sign(
    "HMAC",
    await clave(),
    codificador.encode(emitidaEn),
  );
  if (!igualesEnTiempoConstante(valor.slice(separador + 1), aBase64Url(esperada))) {
    return false;
  }

  const edadS = Math.floor(ahora / 1000) - Number(emitidaEn);
  return edadS >= 0 && edadS < DURACION_SESION_S;
}

/**
 * Extrae el valor de la cookie de sesion de una cabecera `Cookie` cruda.
 *
 * Vive aqui y no en la ruta porque saber como se llama la cookie y como se lee
 * es parte del modelo de sesion, no del transporte HTTP. La ruta solo pregunta
 * "¿quien es?", sin conocer el formato.
 */
export function leerCookieDeSesion(cabecera: string | null): string | undefined {
  return cabecera
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_SESION}=`))
    ?.slice(COOKIE_SESION.length + 1);
}
