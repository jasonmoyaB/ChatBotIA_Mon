"use client";

import type { SyntheticEvent } from "react";

import { useDialogoModal } from "@/hooks/use-dialogo-modal";

import estilos from "./confirmacion-nueva-conversacion.module.css";

interface Props {
  alCancelar: () => void;
  alConfirmar: () => void;
}

export function ConfirmacionNuevaConversacion({ alCancelar, alConfirmar }: Props) {
  const dialogo = useDialogoModal();

  function cancelar(evento: SyntheticEvent) {
    evento.preventDefault();
    alCancelar();
  }

  return (
    <dialog ref={dialogo} className={estilos.dialogo} onCancel={cancelar}>
      <div className={estilos.contenido}>
        <p className={estilos.titulo}>¿Empezar una nueva conversación?</p>
        <p className={estilos.descripcion}>Se borrarán los mensajes del chat actual.</p>
        <div className={estilos.acciones}>
          <button type="button" className={estilos.cancelar} onClick={alCancelar} autoFocus>
            Cancelar
          </button>
          <button type="button" className={estilos.confirmar} onClick={alConfirmar}>
            Borrar conversación
          </button>
        </div>
      </div>
    </dialog>
  );
}
