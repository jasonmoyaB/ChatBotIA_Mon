"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP);

export function usarAnimacionDeTurnos(
  contenedor: RefObject<HTMLElement | null>,
  cantidad: number,
): void {
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const ultimo = contenedor.current?.querySelector("[data-turno]:last-child");
      if (!ultimo) return;
      gsap.fromTo(
        ultimo,
        { autoAlpha: 0, y: 18, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
      );
    },
    { scope: contenedor, dependencies: [cantidad] },
  );
}
