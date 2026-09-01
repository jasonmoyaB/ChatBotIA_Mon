/**
 * Las variables de entorno de las que depende la puerta de entrada.
 *
 * Existe como modulo aparte porque `lib/auth.ts` sabe firmar y comparar, no
 * decidir que hacer cuando el despliegue esta a medias. Eso es una decision de
 * la puerta, y necesita poder consultarlo sin provocar una excepcion.
 */

/**
 * Sin estas dos, el proxy no puede ni validar el token del enlace ni firmar la
 * cookie. `ANTHROPIC_API_KEY` no esta aqui: la puerta no la necesita, y el
 * runtime Edge del proxy ni siquiera la ve.
 */
const SECRETOS_DE_PUERTA = ["CLAVE_ACCESO", "SECRETO_COOKIE"] as const;

/** Los nombres que faltan o estan vacios. Vacio = configuracion completa. */
export function secretosDePuertaQueFaltan(): string[] {
  return SECRETOS_DE_PUERTA.filter((nombre) => !process.env[nombre]);
}

/**
 * Lee una variable obligatoria.
 *
 * Lanza si falta. Quien llame desde un camino que puede alcanzarse con el
 * despliegue a medias debe comprobar antes con `secretosDePuertaQueFaltan()`:
 * una excepcion aqui se convierte en un 500, y un 500 en la puerta es
 * indistinguible de un fallo real.
 */
export function leerSecreto(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}
