/**
 * La pagina que ve quien llega sin sesion.
 *
 * Antes decia solo "No disponible". Ese texto convirtio tres incidencias
 * distintas en el mismo callejon sin salida: abrir la URL sin el token, un
 * despliegue sin variables de entorno, y una cookie caducada producian la misma
 * pantalla muda. Quien la veia no tenia forma de saber cual de las tres era.
 *
 * Ahora dice que hace falta el enlace completo, que es la unica de las tres que
 * la cuidadora puede resolver sola. No nombra el parametro ni el formato de la
 * clave: quien ya tiene el enlace no lo necesita, y quien no lo tiene tampoco
 * aprende nada util.
 *
 * Vive fuera de `proxy.ts` porque son responsabilidades distintas: el proxy
 * decide quien pasa, esto solo redacta. Y una plantilla HTML dentro de un modulo
 * de control de acceso lo empuja hacia el limite de 150 lineas por nada.
 */

const ESTILO = [
  "margin:0;min-height:100vh;display:grid;place-items:center;",
  "padding:24px;text-align:center;",
  "background:#fbf9f6;color:#5c6660;",
  "font:400 20px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif",
].join("");

export const PAGINA_NO_DISPONIBLE = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>No disponible</title>
<style>body{${ESTILO}}p{margin:0;max-width:28rem}strong{color:#1f2421}</style>
</head><body><p><strong>Necesitas el enlace completo.</strong><br>
Abre el enlace que te enviaron por mensaje, entero y tal cual está.<br>
Si lo guardaste en la pantalla de inicio y dejó de entrar, vuelve a abrir ese
mensaje una vez más.</p></body></html>`;
