import { NextRequest } from "next/server";

import { COOKIE_SESION, firmarSesion } from "../../lib/auth";
import { proxy } from "../../proxy";
import { comprobar, seccion } from "./ejecutor";

const SECRETO_DE_PRUEBAS = "secreto-exclusivo-de-pruebas-locales";

/** Ejecuta `accion` con el entorno dado y restaura el original al terminar. */
async function conEntorno(
  entorno: Record<string, string | undefined>,
  accion: () => Promise<void>,
): Promise<void> {
  const anterior = new Map<string, string | undefined>();
  for (const [nombre, valor] of Object.entries(entorno)) {
    anterior.set(nombre, process.env[nombre]);
    if (valor === undefined) delete process.env[nombre];
    else process.env[nombre] = valor;
  }
  try {
    await accion();
  } finally {
    for (const [nombre, valor] of anterior) {
      if (valor === undefined) delete process.env[nombre];
      else process.env[nombre] = valor;
    }
  }
}

async function limpiaElTokenDeLaUrl(): Promise<void> {
  seccion("Proxy: el token no permanece en la URL");

  // Las dos: la puerta se cierra ante cualquier secreto ausente, incluso con
  // una sesion ya valida. Un despliegue a medias tiene que romperse a la vista.
  await conEntorno(
    { CLAVE_ACCESO: "clave-de-pruebas", SECRETO_COOKIE: SECRETO_DE_PRUEBAS },
    async () => {
      const sesion = await firmarSesion();
      const peticion = new NextRequest(
        "https://ejemplo.test/?k=token&vista=chat",
        { headers: { cookie: `${COOKIE_SESION}=${sesion}` } },
      );
      const respuesta = await proxy(peticion);
      comprobar(
        "limpia k aunque la sesion ya sea valida",
        respuesta.headers.get("location") === "https://ejemplo.test/?vista=chat",
      );
    },
  );
}

/**
 * Regresion: un despliegue sin las variables de entorno devolvia 500 al abrir
 * `/?k=...`, con la traza en los logs. La URL pelada seguia dando 401, asi que el
 * sintoma visible era "no disponible" y el fallo real quedaba escondido detras de
 * la query string.
 *
 * La puerta tiene que cerrarse, nunca abrirse ni reventar, ante una configuracion
 * incompleta.
 */
async function cierraSiFaltaConfiguracion(): Promise<void> {
  seccion("Proxy: sin variables de entorno cierra, no revienta");

  const rutas: Array<[string, string, number]> = [
    ["url pelada", "https://ejemplo.test/", 401],
    ["con ?k=", "https://ejemplo.test/?k=lo-que-sea", 401],
    ["api con ?k=", "https://ejemplo.test/api/chat?k=lo-que-sea", 401],
  ];

  await conEntorno(
    { CLAVE_ACCESO: undefined, SECRETO_COOKIE: undefined },
    async () => {
      for (const [nombre, url, esperado] of rutas) {
        let estado = 0;
        try {
          estado = (await proxy(new NextRequest(url))).status;
        } catch {
          estado = -1; // lanzo: en produccion eso es un 500
        }
        comprobar(`${nombre} -> ${esperado} (obtenido: ${estado})`, estado === esperado);
      }
    },
  );

  // Faltando solo una: sigue sin poder decidir, sigue cerrada.
  await conEntorno(
    { CLAVE_ACCESO: "algo", SECRETO_COOKIE: undefined },
    async () => {
      let estado = 0;
      try {
        estado = (await proxy(new NextRequest("https://ejemplo.test/?k=algo"))).status;
      } catch {
        estado = -1;
      }
      comprobar(`falta solo SECRETO_COOKIE -> 401 (obtenido: ${estado})`, estado === 401);
    },
  );
}

export async function pruebasDelProxy(): Promise<void> {
  await limpiaElTokenDeLaUrl();
  await cierraSiFaltaConfiguracion();
}
