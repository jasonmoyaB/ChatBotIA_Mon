# ChatBotIA_Mon

Asistente que responde **solo** con lo que los médicos autorizaron.

No es un chatbot de propósito general. Es un sistema donde una respuesta
inventada tiene consecuencias reales, y todo el diseño se ordena alrededor de eso.

Lo usa la persona que cuida a mamá, desde el móvil, abriendo un enlace.

---

## Cómo funciona

Los documentos médicos se **congelan en tiempo de compilación** y se inyectan
**completos** en cada petición al modelo. No hay recuperación vectorial: el corpus
entero son unos 6.000 tokens, cabe de sobra en el contexto, y trocearlo
introduciría el riesgo de que el fragmento que importa no se recupere.

Ese riesgo no es teórico. Los dos documentos más críticos son los dos más
pequeños: `01_protocolo_emergencias.md` (523 B) y
`02_medicamentos_no_autorizados.md` (385 B). Ante *"tengo fiebre y muchas
náuseas"*, una búsqueda vectorial recuperaría los documentos densos sobre náuseas
y podría dejar fuera el protocolo de emergencias. El bot ofrecería un antiemético
en vez de mandar a urgencias.

```
Cuidadora (móvil, PWA)
   │
   ▼  https://<dominio>/?k=<token>          (una sola vez)
proxy.ts ──► canjea el token por una cookie httpOnly firmada, redirige a /
   │
   ▼  POST /api/chat  (cookie)
Route Handler · runtime nodejs · streaming
   │
   ├─ 1. Pre-filtro de emergencias ──► si dispara: respuesta fija, sin llamar al modelo
   ├─ 2. Corpus completo, congelado en build (cero I/O en runtime)
   └─ 3. API de Anthropic · claude-sonnet-5 · prompt caching
```

### Tres capas de seguridad clínica

1. **Pre-filtro determinista** (`lib/triage/`) — busca señales de alarma por
   patrón antes de llamar al modelo. Es estrictamente aditivo: si no dispara, la
   petición sigue el camino normal.
2. **Contexto completo** — el modelo nunca opera sin ver el protocolo de
   emergencias ni la lista de bloqueo.
3. **Reglas de comportamiento** (`conocimiento/00_reglas_del_bot.md`) — separadas
   del código, para poder ajustarlas sin tocar TypeScript.

---

## Estructura

```
conocimiento/   Los .md. La fuente de verdad médica.
proxy.ts        La puerta de entrada.

app/            La página y la ruta del chat.
  api/chat/     El orquestador: auth → límite → entrada → alarma → modelo.

components/     Render y nada más. Ni fetch, ni lógica de negocio.
  chat/         La pantalla: cabecera, conversación, burbuja, redactor.

hooks/          Estado y efectos. Sin JSX.
services/       Acceso a datos. El único módulo que conoce /api/chat.

lib/            El dominio.
  triage/       Pre-filtro de alarma: señales (datos), evaluar, respuesta.
  anthropic/    Cliente perezoso y el stream de texto.
  api/          Lectura del cuerpo y respuestas HTTP.
  auth · limite · prompt · mensajes · tipos · registro
  conocimiento.generado.ts   El corpus congelado en build.

scripts/        El generador del corpus y el de los iconos.
pruebas/        local/ (sin red), api/ (humo + caché), golden/ (clínicas).
```

El prefijo numérico de los documentos no es cosmético. El caché de prompt es un
match de prefijo por bytes exactos: si el orden de concatenación variara entre
invocaciones, se pagaría la escritura de caché sin leerla nunca. Los números
garantizan un `sort()` determinista y de paso colocan emergencias y bloqueo al
principio del contexto.

`lib/conocimiento.generado.ts` **no se edita a mano.** Lo escribe
`scripts/generar-conocimiento.ts`, que corre en `prebuild` y en `predev`.

Las dependencias van en una sola dirección y nunca al revés:

```
components → hooks → services → lib
app/api    → lib
```

Ningún archivo pasa de 150 líneas. Si uno crece, es que le falta un vecino.

---

## Puesta en marcha

### 1. Instalar

```bash
pnpm install
```

### 2. Las tres variables de entorno

```bash
cp .env.example .env.local
```

| Variable | De dónde sale |
|---|---|
| `ANTHROPIC_API_KEY` | `console.anthropic.com` → Settings → API keys |
| `CLAVE_ACCESO` | Se genera (abajo). Es el token del enlace. |
| `SECRETO_COOKIE` | Se genera (abajo). Firma la cookie de sesión. |

Generar las dos últimas:

```bash
node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
```

> **Emite la API key dentro de un workspace con límite de gasto mensual.**
> `console.anthropic.com` → Settings → Workspaces → crear uno → ponerle un límite
> → crear la key ahí dentro. Ese límite es el **único corte duro de coste** que
> existe. El rate limit de `lib/limite.ts` es defensa en profundidad, no un tope.

### 3. Probar en local

```bash
pnpm probar:local   # pre-filtro, orden del corpus, corpus congelado al día
pnpm probar:api     # invocación real contra Anthropic, sin desplegar nada
pnpm dev            # http://localhost:3000/?k=<CLAVE_ACCESO>
```

`probar:api` es el paso que decide si el resto funciona. Valida de una vez que la
key sirve, que el `MODEL_ID` es correcto y que el **prompt caching funciona**
(`cache_read` > 0 en la segunda llamada). Usa el mismo `construirSystem()` y el
mismo corpus congelado que la ruta, así que el prompt probado es byte a byte el
que se desplegará.

Para probar otro modelo sin tocar código:

```bash
MODEL_ID=claude-opus-5 pnpm probar:api
```

Ese mismo valor se pone luego como variable `MODEL_ID` en Vercel.

### 4. Desplegar

```bash
pnpm dlx vercel link
pnpm dlx vercel env add ANTHROPIC_API_KEY production
pnpm dlx vercel env add CLAVE_ACCESO production
pnpm dlx vercel env add SECRETO_COOKIE production
pnpm dlx vercel --prod
```

El nombre del proyecto acaba siendo el subdominio. Sólo acepta minúsculas,
números y guiones: `chatbot-ia-mom`, no `chatbotIA_Mom`.

### 5. Probar el despliegue

```bash
CHAT_URL=https://<dominio> CLAVE=<CLAVE_ACCESO> pnpm probar:golden
```

Imprime cada caso golden con su respuesta. **Hay que revisarlas a mano**: lo que
está en juego es criterio clínico. Prestar atención a **A5** (la fiebre manda
sobre la náusea), **B1/B2** (paracetamol → negar) y **G4** (no inventar un
teléfono).

Comprobar también en los logs de Vercel que `cache_read` sea mayor que 0 a partir
de la segunda petición. Si se queda en 0, hay algo dinámico contaminando el
prefijo del prompt.

### 6. Entregar el enlace

Mandar **una sola vez**:

```
https://<dominio>/?k=<CLAVE_ACCESO>
```

El proxy canjea el token por una cookie `httpOnly` de un año y redirige a `/`, de
modo que el token no queda en el historial ni en una captura de pantalla. Ella lo
añade a la pantalla de inicio y a partir de ahí entra tocando el icono, sin
escribir nada.

Si el enlace se filtra: cambiar `CLAVE_ACCESO` **y** `SECRETO_COOKIE` en Vercel y
redesplegar. Rotar `SECRETO_COOKIE` invalida todas las sesiones abiertas.

---

## Actualizar los documentos médicos

Editar el `.md` y subirlo:

```bash
pnpm generar        # regenera lib/conocimiento.generado.ts
pnpm probar:local   # comprueba que el corpus congelado coincide
git commit -am "Actualiza dosis de X"
git push            # Vercel redespliega en ~1 minuto
```

`pnpm generar` también corre solo en `prebuild`, así que un `git push` sin
regenerar sigue desplegando el contenido correcto. Se pide aquí para que las
pruebas locales corran contra lo mismo que verá producción.

El historial de cambios en documentos médicos es el historial de git.

---

## Antes de que lo use

El sistema se puede construir y probar tal cual, pero **no debería entregarse el
enlace** con estos puntos abiertos:

1. **Conflicto Paracetamol / Acetaminofén.** `03_medicamentos_autorizados.md`
   (Medicamento 1) lo autoriza; `02_medicamentos_no_autorizados.md` lo prohíbe.
   Mismo principio activo, documentos en contradicción. El bot aplica la lista de
   bloqueo, que es el lado seguro, pero hay que confirmarlo con el médico.
2. **`01_protocolo_emergencias.md` no tiene teléfonos** — solo `Dr. [Nombre]` y
   `[Número]`. En una emergencia real el bot no tiene a quién mandarla.
3. **El Medicamento 1 son datos de plantilla** (`[Ejemplo: 500mg]`). Si entran al
   contexto, el bot podría recitarlos como si fueran una prescripción real.

Faltan además las dosis reales de Enzypride, Ondansetrón, Sertal Compuesto,
Famotidina, Solugastril, Enalapril y Tafil: todas dicen "No indicada". El bot está
diseñado para no inventarlas y remitirá al médico, así que se comporta
correctamente — solo es menos útil de lo que podría.

---

## Notas de implementación

- **El corpus se congela en build, no se lee en runtime.** Un `readFileSync` en
  la función obligaría a pelear con el file tracing del bundler, y cualquier
  variación de lectura entre invocaciones rompería el caché de prompt en silencio.
  Congelado, los bytes del prefijo no pueden cambiar.
- **`pruebas/local/corpus.ts` compara el módulo generado con los `.md` del disco.** Es lo
  que impide que alguien edite una dosis, no regenere, y no se entere.
- **Caché explícito.** El marcador `cache_control` va en el bloque de `system`
  (`lib/prompt.ts`), y ese texto no puede contener nada dinámico: ni fechas, ni
  identificadores de sesión, ni nombres. Lo que varía va en `messages`.
- **`proxy.ts`, no `middleware.ts`.** Next 16 renombró la convención. Usa Web
  Crypto porque corre en el runtime Edge, donde `node:crypto` no existe.
- **La ruta revalida la cookie por su cuenta.** No confía en que el proxy la haya
  visto: si algún día cambia el `matcher`, `/api/chat` no queda abierta en
  silencio.
- **`stop_reason: "refusal"`.** El modelo puede declinar con HTTP 200 y sin texto.
  Sin la comprobación que escribe `MENSAJE_RECHAZO`, la pantalla se quedaría en
  blanco.
- **Cliente de Anthropic perezoso.** `new Anthropic()` lanza si falta la key, y a
  nivel de módulo eso rompería el build de Next, que importa las rutas para
  recolectarlas antes de que exista ninguna variable de runtime.

### Coste

Con `claude-sonnet-5` ($3 entrada / $15 salida por millón de tokens, lectura de
caché ~$0,30): corpus de ~6k tokens, respuestas de 400–600. Del orden de **1–2 ¢
por mensaje** sin caché caliente, **~0,7 ¢** con él. Uso realista de una
cuidadora: **3–6 USD/mes**.

---

## Historia

La primera versión corría sobre AWS: CDK, CloudFront + S3, Lambda con Function
URL en modo `RESPONSE_STREAM`, Secrets Manager y Bedrock. Nunca llegó a
desplegarse. Todas las cuotas de inferencia de Claude en la cuenta estaban a cero
—falta el formulario de caso de uso de Anthropic, cuya aprobación no tiene plazo—
y ninguna de esas piezas tiene equivalente en Vercel.

Lo que sobrevivió intacto de aquella versión es lo que importaba: el pre-filtro de
triage, la decisión de no trocear el corpus, el formato del prompt y los casos
golden. Lo que se tiró fue infraestructura.
