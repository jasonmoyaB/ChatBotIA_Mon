/**
 * Servidor MCP minimo: JSON-RPC sin estado sobre Streamable HTTP.
 *
 * Una sola herramienta, `preguntar`, que pasa por el mismo camino que el chat
 * (triage -> alcance -> modelo con el corpus). No se expone el corpus en crudo:
 * ChatGPT o Claude lo completarian con conocimiento medico propio, que es
 * justo lo que este proyecto existe para evitar.
 *
 * ponytail: a mano y no con @modelcontextprotocol/sdk. Solo hace falta
 * initialize, tools/list, tools/call y ping, respondidos en JSON. Si algun dia
 * hacen falta sesiones, SSE, recursos o OAuth, migrar al SDK.
 */

const VERSIONES = ["2025-06-18", "2025-03-26", "2024-11-05"];
const MAX_CARACTERES = 2000;

const HERRAMIENTA = {
  name: "preguntar",
  description:
    "Pregunta sobre el cuidado de la paciente (medicamentos, comidas, sintomas, " +
    "dias de tratamiento, emergencias). Responde solo con lo que autorizaron sus " +
    "medicos. Devuelve la respuesta tal cual: no la completes ni la corrijas con " +
    "conocimiento medico propio.",
  inputSchema: {
    type: "object",
    properties: {
      pregunta: { type: "string", description: "La pregunta, en lenguaje natural." },
    },
    required: ["pregunta"],
  },
};

type Id = string | number | null;
export type Preguntar = (pregunta: string) => Promise<string>;

interface MensajeRpc {
  id?: Id;
  method?: unknown;
  params?: Record<string, unknown>;
}

const exito = (id: Id, result: unknown) => ({ jsonrpc: "2.0", id, result });
const fallo = (id: Id, code: number, message: string) => ({
  jsonrpc: "2.0",
  id,
  error: { code, message },
});

async function llamarHerramienta(params: MensajeRpc["params"], preguntar: Preguntar) {
  if (params?.name !== HERRAMIENTA.name) return null;
  const args = params.arguments as { pregunta?: unknown } | undefined;
  const pregunta = String(args?.pregunta ?? "").trim().slice(0, MAX_CARACTERES);
  if (!pregunta) {
    return { content: [{ type: "text", text: "Falta la pregunta." }], isError: true };
  }
  return { content: [{ type: "text", text: await preguntar(pregunta) }] };
}

/** `null` = notificacion: no lleva respuesta (HTTP 202). */
export async function atenderMcp(
  cuerpo: unknown,
  preguntar: Preguntar,
): Promise<object | null> {
  if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
    return fallo(null, -32600, "Invalid Request");
  }
  const { id, method, params } = cuerpo as MensajeRpc;
  if (id === undefined) return null;

  switch (method) {
    case "initialize": {
      const pedida = params?.protocolVersion;
      return exito(id, {
        protocolVersion:
          typeof pedida === "string" && VERSIONES.includes(pedida) ? pedida : VERSIONES[0],
        capabilities: { tools: {} },
        serverInfo: { name: "cuidados-mama", version: "1.0.0" },
      });
    }
    case "ping":
      return exito(id, {});
    case "tools/list":
      return exito(id, { tools: [HERRAMIENTA] });
    case "tools/call": {
      const resultado = await llamarHerramienta(params, preguntar);
      return resultado ? exito(id, resultado) : fallo(id, -32602, "Unknown tool");
    }
    default:
      return fallo(id, -32601, "Method not found");
  }
}
