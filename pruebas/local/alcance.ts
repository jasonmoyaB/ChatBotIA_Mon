import { POST } from "../../app/api/chat/route";
import { estaDentroDelAlcance } from "../../lib/alcance/evaluar";
import { COOKIE_SESION, firmarSesion } from "../../lib/auth";
import { FUERA_DE_CONTEXTO } from "../../lib/mensajes";
import type { Turno } from "../../lib/tipos";
import { CASOS } from "../golden/casos";
import { comprobar, seccion } from "./ejecutor";

const CONSULTAS_AJENAS = [
  "¿Cuál es la capital de Costa Rica?",
  "¿Cuál es la capital de España?",
  "Cuéntame un chiste",
  "¿Quién es el presidente de Francia?",
  "Escribe código en JavaScript",
  "¿Cuánto es 25 por 8?",
];

async function comprobarRespuestaFija(): Promise<void> {
  const secretoAnterior = process.env.SECRETO_COOKIE;
  process.env.SECRETO_COOKIE = "secreto-de-prueba-para-alcance";
  try {
    const sesion = await firmarSesion();
    const peticion = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { cookie: `${COOKIE_SESION}=${sesion}` },
      body: JSON.stringify({ mensaje: CONSULTAS_AJENAS[0], historial: [] }),
    });
    const respuesta = await POST(peticion);
    comprobar("responde sin llamar al modelo", (await respuesta.text()) === FUERA_DE_CONTEXTO);
  } finally {
    if (secretoAnterior === undefined) delete process.env.SECRETO_COOKIE;
    else process.env.SECRETO_COOKIE = secretoAnterior;
  }
}

export async function pruebasDelAlcance(): Promise<void> {
  seccion("Alcance: rechaza temas ajenos");
  for (const consulta of CONSULTAS_AJENAS) {
    comprobar(consulta, !estaDentroDelAlcance(consulta, []));
  }

  seccion("Alcance: conserva consultas medicas");
  for (const caso of CASOS.filter(({ id }) => id !== "G5")) {
    comprobar(caso.pregunta, estaDentroDelAlcance(caso.pregunta, []));
  }

  const historial: Turno[] = [
    { role: "user", content: "¿Cuánto Enalapril le toca?" },
    { role: "assistant", content: "La dosis no está indicada." },
  ];
  comprobar(
    "permite un seguimiento medico breve",
    estaDentroDelAlcance("¿Y cada cuánto?", historial),
  );
  await comprobarRespuestaFija();
}
