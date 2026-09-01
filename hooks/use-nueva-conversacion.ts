"use client";

import { useCallback, useState } from "react";

export function useNuevaConversacion(alReiniciar: () => void) {
  const [confirmando, setConfirmando] = useState(false);

  const solicitar = useCallback(() => setConfirmando(true), []);
  const cancelar = useCallback(() => setConfirmando(false), []);
  const confirmar = useCallback(() => {
    alReiniciar();
    setConfirmando(false);
  }, [alReiniciar]);

  return { confirmando, solicitar, cancelar, confirmar };
}
