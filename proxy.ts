import { NextResponse, type NextRequest } from "next/server";

import {
  COOKIE_SESION,
  DURACION_SESION_S,
  claveDeAccesoValida,
  firmarSesion,
  sesionValida,
} from "@/lib/auth";
import { NO_AUTORIZADO } from "@/lib/mensajes";

function redirigirSinToken(peticion: NextRequest): NextResponse {
  const limpia = new URL(peticion.nextUrl);
  limpia.searchParams.delete("k");
  return NextResponse.redirect(limpia);
}

async function canjearToken(peticion: NextRequest): Promise<NextResponse> {
  const respuesta = redirigirSinToken(peticion);
  respuesta.cookies.set({
    name: COOKIE_SESION,
    value: await firmarSesion(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_S,
  });
  return respuesta;
}

/**
 * Deliberadamente parca: no dice que es el sitio ni que existe una clave.
 * La API responde texto plano; el navegador, una pagina.
 */
function rechazar(esApi: boolean): NextResponse {
  return new NextResponse(esApi ? NO_AUTORIZADO : PAGINA_NO_DISPONIBLE, {
    status: 401,
    headers: {
      "Content-Type": esApi
        ? "text/plain; charset=utf-8"
        : "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/**
 * Puerta de entrada.
 *
 * Tres caminos:
 *  1. Cookie valida            -> pasa.
 *  2. `?k=<CLAVE_ACCESO>`      -> setea la cookie y redirige a `/` sin el token.
 *  3. Ninguna de las anteriores -> 401 con una pagina neutra.
 *
 * Una sesion valida conserva acceso, pero cualquier `?k=` se elimina de la URL
 * para que el secreto no quede en historial, capturas ni cabeceras Referer.
 *
 * `/api/chat` vuelve a verificar la cookie por su cuenta. No confia en que el
 * proxy la haya visto: si algun dia cambia el `matcher`, la ruta no queda
 * abierta en silencio.
 */
export async function proxy(peticion: NextRequest) {
  if (await sesionValida(peticion.cookies.get(COOKIE_SESION)?.value)) {
    if (peticion.nextUrl.searchParams.has("k")) {
      return redirigirSinToken(peticion);
    }
    return NextResponse.next();
  }

  if (claveDeAccesoValida(peticion.nextUrl.searchParams.get("k"))) {
    return canjearToken(peticion);
  }

  return rechazar(peticion.nextUrl.pathname.startsWith("/api/"));
}

const PAGINA_NO_DISPONIBLE = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>No disponible</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;
background:#fbf9f6;color:#5c6660;font:400 20px/1.6 system-ui,sans-serif}</style>
</head><body><p>No disponible.</p></body></html>`;

export const config = {
  // Todo menos los estaticos de Next y los iconos: el manifest y los iconos de
  // la PWA tienen que servirse sin sesion o el "Añadir a pantalla de inicio"
  // se queda sin icono.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|icono-).*)",
  ],
};
