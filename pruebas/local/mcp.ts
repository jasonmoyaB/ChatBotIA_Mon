import { claveMcpValida } from "../../lib/auth";
import { atenderMcp } from "../../lib/mcp";
import { comprobar, seccion } from "./ejecutor";

const eco = async (p: string) => `eco:${p}`;
const rpc = (method: string, params?: object) => ({ jsonrpc: "2.0", id: 1, method, params });

export async function pruebasDelMcp(): Promise<void> {
  seccion("MCP: protocolo y puerta");

  const init = (await atenderMcp(rpc("initialize", { protocolVersion: "2025-03-26" }), eco)) as any;
  comprobar("initialize negocia la version pedida", init.result.protocolVersion === "2025-03-26");

  comprobar(
    "las notificaciones no llevan respuesta",
    (await atenderMcp({ jsonrpc: "2.0", method: "notifications/initialized" }, eco)) === null,
  );

  const lista = (await atenderMcp(rpc("tools/list"), eco)) as any;
  comprobar("expone solo `preguntar`", lista.result.tools.map((t: any) => t.name).join() === "preguntar");

  const llamada = (await atenderMcp(
    rpc("tools/call", { name: "preguntar", arguments: { pregunta: " ¿puede comer arroz? " } }),
    eco,
  )) as any;
  comprobar("tools/call pasa la pregunta al pipeline", llamada.result.content[0].text === "eco:¿puede comer arroz?");

  const vacia = (await atenderMcp(rpc("tools/call", { name: "preguntar", arguments: {} }), eco)) as any;
  comprobar("pregunta vacia es error de herramienta", vacia.result.isError === true);

  const otra = (await atenderMcp(rpc("tools/call", { name: "borrar" }), eco)) as any;
  comprobar("herramienta desconocida es error", otra.error?.code === -32602);

  const previa = process.env.CLAVE_MCP;
  delete process.env.CLAVE_MCP;
  comprobar("sin CLAVE_MCP la puerta queda cerrada", !claveMcpValida("cualquiera"));
  process.env.CLAVE_MCP = "secreta";
  comprobar("clave correcta pasa", claveMcpValida("secreta"));
  comprobar("clave incorrecta no pasa", !claveMcpValida("secretb"));
  if (previa === undefined) delete process.env.CLAVE_MCP;
  else process.env.CLAVE_MCP = previa;
}
