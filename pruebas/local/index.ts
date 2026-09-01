/**
 * Pruebas que no llaman a la API. Ejecutar con `pnpm probar:local`.
 *
 * Cubren las cosas que fallarian en silencio:
 *  - el pre-filtro de emergencias y el marcador que usa la interfaz,
 *  - el orden determinista del corpus, del que depende el cache del prompt,
 *  - que el corpus congelado en build siga coincidiendo con los .md del disco.
 */

import { pruebasDelCorpus } from "./corpus";
import { pruebasDelAlcance } from "./alcance";
import { resumen } from "./ejecutor";
import { pruebasDePeticion } from "./peticion";
import { pruebasDelProxy } from "./proxy";
import { pruebasDeRespuestaAlarma, pruebasDelTriage } from "./triage";

pruebasDelTriage();
pruebasDeRespuestaAlarma();
await pruebasDelAlcance();
pruebasDelCorpus();
await pruebasDePeticion();
await pruebasDelProxy();

resumen();
