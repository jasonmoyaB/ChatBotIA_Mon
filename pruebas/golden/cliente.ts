/**
 * Habla con el despliegue igual que lo hace el navegador de la cuidadora.
 */

export const CHAT_URL = process.env.CHAT_URL ?? "http://localhost:3000";

export function requerirClave(): string {
  const clave = process.env.CLAVE;
  if (clave) return clave;

  console.error("Falta la variable CLAVE (el valor de CLAVE_ACCESO).");
  console.error("  CHAT_URL=https://... CLAVE=... pnpm probar:golden");
  process.exit(1);
}

/**
 * Canjea `?k=<clave>` por la cookie de sesion.
 *
 * `redirect: "manual"` es imprescindible: el proxy responde con un 307 hacia
 * `/`, y si fetch siguiera la redireccion se perderia la cabecera Set-Cookie.
 */
export async function abrirSesion(clave: string): Promise<string> {
  const url = new URL(CHAT_URL);
  url.searchParams.set("k", clave);

  const respuesta = await fetch(url, { redirect: "manual" });
  const galleta = respuesta.headers.get("set-cookie");

  if (!galleta) {
    throw new Error(
      `No hubo Set-Cookie (HTTP ${respuesta.status}). ` +
        "La clave no coincide con CLAVE_ACCESO del despliegue.",
    );
  }

  console.log(`Sesion abierta contra ${CHAT_URL}`);
  return galleta.split(";")[0]!;
}

export async function preguntar(
  sesion: string,
  pregunta: string,
): Promise<string> {
  const respuesta = await fetch(new URL("/api/chat", CHAT_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sesion },
    body: JSON.stringify({ mensaje: pregunta }),
  });

  if (!respuesta.ok) {
    return `[HTTP ${respuesta.status}] ${await respuesta.text()}`;
  }
  return (await respuesta.text()).trim();
}
