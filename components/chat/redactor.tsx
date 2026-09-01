"use client";

import type { FormEvent } from "react";

import { Campo } from "./campo";
import estilos from "./chat.module.css";

interface Props {
  borrador: string;
  enCurso: boolean;
  alEscribir: (texto: string) => void;
  alEnviar: () => void;
}

export function Redactor({ borrador, enCurso, alEscribir, alEnviar }: Props) {
  function alSometer(evento: FormEvent) {
    evento.preventDefault();
    alEnviar();
  }

  return (
    <form className={estilos.formulario} onSubmit={alSometer}>
      <Campo
        valor={borrador}
        ocupado={enCurso}
        alEscribir={alEscribir}
        alEnviar={alEnviar}
      />
      <button
        type="submit"
        className={estilos.boton}
        disabled={enCurso || !borrador.trim()}
      >
        {enCurso ? "Enviando" : "Enviar"}
      </button>
    </form>
  );
}
