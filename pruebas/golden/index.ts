/**
 * Ejecuta los casos golden contra el despliegue. `pnpm probar:golden`.
 *
 *   CHAT_URL=https://chatbot-ia-mom.vercel.app CLAVE=<CLAVE_ACCESO> pnpm probar:golden
 *
 * No afirma nada automaticamente sobre el texto del modelo: imprime cada
 * respuesta junto a lo que se espera, para revisarla a mano. Lo que esta en
 * juego es criterio clinico, y eso lo juzga una persona.
 */

import { CASOS } from "./casos";
import { abrirSesion, preguntar, requerirClave } from "./cliente";

const raya = "-".repeat(72);

async function main(): Promise<void> {
  const sesion = await abrirSesion(requerirClave());

  for (const caso of CASOS) {
    console.log(`\n${raya}\n${caso.id}  "${caso.pregunta}"`);
    console.log(`espera: ${caso.espera}\n`);
    try {
      console.log(await preguntar(sesion, caso.pregunta));
    } catch (error) {
      console.error(`ERROR: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\n${raya}`);
  console.log("Revisa cada respuesta a mano contra lo que se esperaba.");
  console.log(
    "Comprueba tambien cache_read en los logs de Vercel (caso H1): en la\n" +
      "segunda peticion en adelante debe ser mayor que 0.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
