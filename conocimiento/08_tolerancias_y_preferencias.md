# TOLERANCIAS Y PREFERENCIAS DE ELLA

Este documento registra qué le sienta bien y qué no, en la práctica.

**No es una lista médica.** No autoriza nada. Sirve para elegir mejor **dentro**
de lo que `05_alimentos_permitidos_y_prohibidos.md` ya permite.

---

## JERARQUÍA — LA PARTE QUE NO SE PUEDE EQUIVOCAR

Este documento es el **último** en la cadena de decisión y el que menos manda:

```
01_protocolo_emergencias.md              ← la alarma corta todo
02_medicamentos_no_autorizados.md        ← prohibición, gana siempre
05_alimentos_permitidos_y_prohibidos.md  ← qué se puede comer
06_preparacion_y_rutina_de_comidas.md    ← cómo, cuánto y cuándo
08_tolerancias_y_preferencias.md         ← cuál de lo permitido elegir
```

De ahí salen dos reglas asimétricas:

- **Una preferencia NUNCA desbloquea un prohibido.** Que le encante el café, el
  ceviche o el chile no cambia nada: `05` los prohíbe y siguen prohibidos. Si la
  cuidadora dice "es que le gusta mucho", la respuesta sigue siendo que no está
  permitido.
- **Un "le cayó mal" SÍ desaconseja un permitido.** Si un alimento está en la
  lista de permitidos de `05` pero aquí figura como mal tolerado, el asistente
  no lo propone y ofrece otro de la misma lista.

Lo mismo con los medicamentos: nada de lo que se escriba aquí cambia una dosis,
una frecuencia ni una autorización de `03_medicamentos_autorizados.md`.

---

## REGLA DURA DE ESTE DOCUMENTO

Todo campo marcado **`[Por completar]`** significa que el dato **no existe**.

El asistente:

- **No supone** qué le gusta ni qué tolera.
- **No deduce** una tolerancia porque el alimento esté permitido en `05`.
  Permitido no es lo mismo que bien tolerado.
- **No deduce** una intolerancia porque el alimento sea "pesado" en general.
- Si le preguntan por algo que no está registrado, lo dice: no está anotado, y
  sugiere probar en cantidad pequeña **solo si el alimento está permitido en
  `05`**, y anotar el resultado aquí.

---

## ALERGIAS E INTOLERANCIAS CONOCIDAS

Lo más importante de este documento. Si hay una alergia, va aquí y **manda sobre
la lista de permitidos de `05`**.

| Alimento o sustancia | Tipo (alergia / intolerancia) | Qué le pasa | Confirmado por |
|---|---|---|---|
| `[Por completar]` | `[Por completar]` | `[Por completar]` | `[Por completar]` |

- Alergias a medicamentos: `[Por completar]`

Si esta tabla está vacía, el asistente **no asume que no hay alergias**: asume
que no están registradas, y ante una reacción manda `01_protocolo_emergencias.md`.

---

## ALIMENTOS BIEN TOLERADOS

Alimentos permitidos en `05` que ella ya ha comido sin problema. Son los que el
asistente propone primero, sobre todo los días de quimioterapia.

| Alimento | Cómo se lo prepara | Notas |
|---|---|---|
| `[Por completar]` | `[Por completar]` | `[Por completar]` |

---

## ALIMENTOS QUE LE HAN CAÍDO MAL

Alimentos permitidos en `05` que en la práctica le sentaron mal. El asistente
**no los propone**, aunque estén permitidos.

| Alimento | Qué le provocó | Cuándo pasó |
|---|---|---|
| `[Por completar]` | `[Por completar]` | `[Por completar]` |

---

## AVERSIONES Y SENSIBILIDADES

`04_protocolos_por_sintoma.md` avisa de que los olores intensos disparan náusea,
y `06_preparacion_y_rutina_de_comidas.md` de que las temperaturas extremas
irritan. Aquí se anotan las suyas concretas.

- Olores que le provocan náusea: `[Por completar]`
- Texturas que no tolera: `[Por completar]`
- Temperaturas que le sientan peor: `[Por completar]`
- Sabores que rechaza: `[Por completar]`
- Otros disparadores (ruido, movimiento, momento del día): `[Por completar]`

---

## HORARIOS Y CANTIDADES REALES

`06_preparacion_y_rutina_de_comidas.md` indica entre 5 y 6 comidas pequeñas al
día. Aquí se anota cómo queda eso en su día real.

| Comida | Hora habitual | Cantidad que suele tolerar |
|---|---|---|
| Desayuno | `[Por completar]` | `[Por completar]` |
| Media mañana | `[Por completar]` | `[Por completar]` |
| Almuerzo | `[Por completar]` | `[Por completar]` |
| Media tarde | `[Por completar]` | `[Por completar]` |
| Cena | `[Por completar]` | `[Por completar]` |
| Merienda nocturna | `[Por completar]` | `[Por completar]` |

- ¿Prefiere los líquidos separados de las comidas? `[Por completar]`
- Cantidad de agua que suele tomar al día: `[Por completar]`

---

## HORARIOS DE MEDICAMENTOS EN SU RUTINA

Solo el **momento del día** en que los toma en la práctica. La dosis y la
frecuencia siguen viniendo únicamente de `03_medicamentos_autorizados.md`.

| Medicamento | Momento del día | Referencia en `03` |
|---|---|---|
| `[Por completar]` | `[Por completar]` | `[Por completar]` |

Si `03` dice *"No indicada"* para la frecuencia de un medicamento, apuntar aquí
una hora **no crea** una pauta. Sigue haciendo falta la del médico.

---

## OTRAS PREFERENCIAS DEL CUIDADO

- Cómo prefiere que le hablen del tratamiento: `[Por completar]`
- Cosas que la tranquilizan: `[Por completar]`
- Cosas que la ponen ansiosa: `[Por completar]`
- Nivel de autonomía (qué hace ella sola, qué necesita ayuda): `[Por completar]`

---

## CÓMO USA EL ASISTENTE ESTE DOCUMENTO

Ejemplos de la conducta correcta:

- *"¿Le puedo dar pescado?"* → Está permitido en `05`, bien cocido. Si figura en
  "le han caído mal", avisar y proponer otra proteína permitida.
- *"¿Le doy café? Le encanta."* → No. `05` lo prohíbe. La preferencia no cambia
  la prohibición.
- *"¿Qué le preparo hoy que está con náusea?"* → Elegir de "bien tolerados" que
  además esté en el apoyo de náuseas de `04`. Si "bien tolerados" está vacío,
  proponer de `05` y decir que no hay nada anotado sobre su tolerancia.
- *"¿A qué hora le toca la pastilla?"* → Solo si está escrito. Si dice
  `[Por completar]`, decir que no está anotado y remitir a `03` o al médico.

---

## PENDIENTE

Este documento está vacío a propósito. Lo completa la cuidadora observando a la
paciente, y se actualiza cada vez que un alimento resulte bien o mal tolerado.
Nunca lo rellena el asistente.
