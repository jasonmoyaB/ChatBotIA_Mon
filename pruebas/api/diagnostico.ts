/**
 * Traduce los fallos habituales de la API a algo accionable.
 *
 * Un `AuthenticationError` a pelo no dice donde se crea una key ni por que hay
 * que crearla dentro del workspace con limite de gasto. Estas son las cuatro
 * cosas que fallan de verdad la primera vez que se configura el proyecto.
 */

import Anthropic from "@anthropic-ai/sdk";

function porAutenticacion(): string {
  return [
    "La API key no es valida.",
    "",
    "  1. console.anthropic.com -> Settings -> API keys",
    "  2. Crea la key DENTRO del workspace que tiene limite de gasto mensual.",
    "  3. Ponla en .env.local:  ANTHROPIC_API_KEY=sk-ant-...",
  ].join("\n");
}

function porModeloInexistente(modelo: string): string {
  return [
    `El modelo "${modelo}" no existe o la key no tiene acceso.`,
    "Los IDs actuales van sin sufijo de fecha: claude-sonnet-5, claude-opus-5.",
  ].join("\n");
}

function porSaldo(): string {
  return [
    "La key funciona, pero la cuenta no tiene saldo.",
    "",
    "  console.anthropic.com -> Plans & Billing -> comprar creditos",
    "",
    "Con 5 USD sobra para meses de uso real: el corpus son ~6k tokens",
    "cacheados y cada mensaje cuesta del orden de 1 centimo.",
    "",
    "Al configurar el billing, ponle tambien un limite de gasto mensual al",
    "workspace. Ese limite es el unico corte duro de coste que existe.",
  ].join("\n");
}

function porPeticionRechazada(mensaje: string): string {
  return [
    "La API rechazo la peticion:",
    `  ${mensaje}`,
    "",
    "Si menciona `budget_tokens` o un prefill de assistant: son parametros",
    "eliminados en los modelos actuales. La ruta usa thinking adaptativo.",
  ].join("\n");
}

function porFaltaDeClave(): string {
  return [
    "Falta ANTHROPIC_API_KEY.",
    "",
    '  PowerShell:  $env:ANTHROPIC_API_KEY="sk-ant-..."',
    "  bash:        export ANTHROPIC_API_KEY=sk-ant-...",
    "",
    "O ponla en .env.local y lanza con:  node --env-file=.env.local ...",
  ].join("\n");
}

export function diagnosticar(error: unknown, modelo: string): string {
  if (error instanceof Anthropic.AuthenticationError) return porAutenticacion();
  if (error instanceof Anthropic.NotFoundError) {
    return porModeloInexistente(modelo);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "Limite de peticiones alcanzado. Espera un momento y reintenta.";
  }
  if (error instanceof Anthropic.BadRequestError) {
    // La key es valida (esto llega despues de autenticar), lo que falta es saldo.
    return error.message.toLowerCase().includes("credit balance")
      ? porSaldo()
      : porPeticionRechazada(error.message);
  }
  if (error instanceof Anthropic.APIError) {
    return `Error de API ${error.status}: ${error.message}`;
  }

  const mensaje = error instanceof Error ? error.message : String(error);
  const faltaLaClave =
    mensaje.toLowerCase().includes("api_key") || mensaje.includes("apiKey");
  return faltaLaClave ? porFaltaDeClave() : mensaje;
}
