import estilos from "./chat.module.css";

export function Cabecera() {
  return (
    <header className={estilos.cabecera}>
      <div className={estilos.identidad}>
        <span className={estilos.marca} aria-hidden="true">A</span>
        <div>
          <h1>Asistente de cuidado</h1>
          <p>Indicaciones médicas, explicadas con claridad</p>
        </div>
      </div>
      <p className={estilos.privacidad}>
        <span aria-hidden="true" />
        Sesión privada
      </p>
    </header>
  );
}
