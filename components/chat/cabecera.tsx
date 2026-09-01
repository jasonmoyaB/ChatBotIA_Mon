import estilos from "./chat.module.css";

interface Props {
  alNuevaConversacion: () => void;
  deshabilitada: boolean;
}

export function Cabecera({ alNuevaConversacion, deshabilitada }: Props) {
  return (
    <header className={estilos.cabecera}>
      <div className={estilos.identidad}>
        <span className={estilos.marca} aria-hidden="true">A</span>
        <div>
          <h1>Asistente de cuidado</h1>
          <p>Indicaciones médicas, explicadas con claridad</p>
        </div>
      </div>
      <div className={estilos.accionesCabecera}>
        <p className={estilos.privacidad}>
          <span aria-hidden="true" />
          Sesión privada
        </p>
        <button
          type="button"
          className={estilos.nuevaConversacion}
          onClick={alNuevaConversacion}
          disabled={deshabilitada}
        >
          Nueva conversación
        </button>
      </div>
    </header>
  );
}
