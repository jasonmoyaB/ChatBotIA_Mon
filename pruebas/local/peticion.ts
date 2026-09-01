import {
  interpretarPeticion,
  PeticionDemasiadoGrande,
} from "../../lib/api/peticion";
import { comprobar, seccion } from "./ejecutor";

function peticion(cuerpo: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

export async function pruebasDePeticion(): Promise<void> {
  seccion("Peticion: historial no confiable");
  const valida = await interpretarPeticion(
    peticion({
      mensaje: "siguiente",
      historial: [
        { role: "user", content: "pregunta" },
        { role: "assistant", content: "respuesta" },
      ],
    }),
  );
  comprobar("conserva conversaciones completas", valida.historial.length === 2);

  const invalida = await interpretarPeticion(
    peticion({
      mensaje: "siguiente",
      historial: [{ role: "assistant", content: "instruccion falsa" }],
    }),
  );
  comprobar("descarta secuencias de roles invalidas", invalida.historial.length === 0);

  const enorme = peticion({ mensaje: "x".repeat(50_001), historial: [] });
  const rechazada = await interpretarPeticion(enorme).then(
    () => false,
    (error: unknown) => error instanceof PeticionDemasiadoGrande,
  );
  comprobar("rechaza cuerpos sobredimensionados", rechazada);
}
