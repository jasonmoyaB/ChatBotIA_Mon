import type { NextConfig } from "next";

const CABECERAS_SEGURIDAD = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const config: NextConfig = {
  // El corpus medico se congela en tiempo de build (scripts/generar-conocimiento.ts),
  // asi que en runtime no hay lectura de disco y no hace falta file tracing.
  reactStrictMode: true,
  poweredByHeader: false,
  // Next genera AGENTS.md y CLAUDE.md por su cuenta; este repo no los quiere.
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: CABECERAS_SEGURIDAD }];
  },
};

export default config;
