"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useDialogoModal(): RefObject<HTMLDialogElement | null> {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const actual = dialogo.current;
    actual?.showModal();
    return () => actual?.close();
  }, []);

  return dialogo;
}
