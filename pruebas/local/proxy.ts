import { NextRequest } from "next/server";

import { COOKIE_SESION, firmarSesion } from "../../lib/auth";
import { proxy } from "../../proxy";
import { comprobar, seccion } from "./ejecutor";

export async function pruebasDelProxy(): Promise<void> {
  seccion("Proxy: el token no permanece en la URL");
  const secretoAnterior = process.env.SECRETO_COOKIE;
  process.env.SECRETO_COOKIE = "secreto-exclusivo-de-pruebas-locales";

  try {
    const sesion = await firmarSesion();
    const peticion = new NextRequest("https://ejemplo.test/?k=token&vista=chat", {
      headers: { cookie: `${COOKIE_SESION}=${sesion}` },
    });
    const respuesta = await proxy(peticion);
    comprobar(
      "limpia k aunque la sesion ya sea valida",
      respuesta.headers.get("location") === "https://ejemplo.test/?vista=chat",
    );
  } finally {
    if (secretoAnterior === undefined) delete process.env.SECRETO_COOKIE;
    else process.env.SECRETO_COOKIE = secretoAnterior;
  }
}
