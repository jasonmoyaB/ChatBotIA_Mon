# MAPA DE SÍNTOMAS → RESPUESTA AUTORIZADA

Este documento NO añade medicamentos nuevos ni dosis nuevas. Solo conecta lo que
el usuario dice (síntoma) con lo que ya está escrito en los otros documentos.

Documentos de referencia:
- `medicamentos_autorizados.md` — única fuente de qué se puede tomar y en qué dosis.
- `medicamentos_no_autorizados.md` — lista de bloqueo, tiene prioridad.
- `protocolo_emergencias.md` — tiene prioridad sobre TODO lo demás.
- `reglas_alimentacion.md` — medidas de apoyo no farmacológicas.

---

## ORDEN DE DECISIÓN (obligatorio, siempre en este orden)

1. **¿Hay síntoma de alarma?** → consultar `protocolo_emergencias.md`.
   Si SÍ: no se sugiere ningún medicamento. Se indica contacto médico o urgencias.
2. **¿El medicamento está en la lista de bloqueo?** → `medicamentos_no_autorizados.md`.
   Si SÍ: se niega, aunque también aparezca en la lista de autorizados.
3. **¿Está en la lista autorizada?** → `medicamentos_autorizados.md`.
   Si NO aparece: responder exactamente
   *"Ese medicamento NO está en la lista autorizada por los médicos."*
4. **Añadir la medida de apoyo** de `reglas_alimentacion.md` cuando aplique.

Regla transversal: si un campo dice "No indicada" en `medicamentos_autorizados.md`,
el chatbot **no inventa** una dosis ni un horario. Remite al envase o al médico.

---

## SÍNTOMAS DE ALARMA — CORTAN CUALQUIER SUGERENCIA

| Si mamá dice… | Fuente | Respuesta |
|---|---|---|
| Fiebre sobre 38 °C | `protocolo_emergencias.md` → Síntomas de alarma | Contactar médico o urgencias de inmediato. No dar medicamento. |
| Dificultad para respirar o dolor en el pecho | `protocolo_emergencias.md` → Síntomas de alarma | Contactar médico o urgencias de inmediato. No dar medicamento. |
| Vómitos que no le dejan tomar líquidos | `protocolo_emergencias.md` → Síntomas de alarma | Urgencias. **No** basta un antiemético. |

> `protocolo_emergencias.md` tiene los contactos como plantilla vacía
> (`Dr. [Nombre]`, `[Número]`). Mientras no se rellenen, el chatbot no puede dar
> un teléfono real y debe indicar el número de emergencias local.

---

## NÁUSEAS Y VÓMITOS

Primero descartar la alarma: si el vómito impide hidratarse → urgencias.

| Situación | Medicamento autorizado | Referencia |
|---|---|---|
| Náuseas o vómitos, indicación general | Metoclopramida 10 mg | `medicamentos_autorizados.md` → Medicamento 3 |
| Náuseas o vómitos según pauta del oncólogo | Ondansetrón (On.setron-Denk) 8 mg bucodispersable | → Medicamento 5 |
| Náuseas con pesadez, regurgitación o vaciamiento lento | Domperidona (Gastroflux) 10 mg | → Medicamento 9 |

**Detalles que el chatbot debe repetir tal cual:**
- **Metoclopramida:** 1 tableta de 10 mg, dos veces al día, **30 minutos antes de
  las comidas**. Si aparecen movimientos anormales de cara, lengua, cuello o
  extremidades → consultar al médico.
- **Ondansetrón:** comprimido de 8 mg que se deshace en la boca. La frecuencia
  **no está definida** en el documento: decir *"solo la que te indicó el médico"*.
  Nunca combinar con apomorfina.
- **Domperidona:** generalmente antes de las comidas. Precaución por ritmo
  cardíaco, en mayores de 60 años y si hay problemas hepáticos o renales.
- **Nunca sugerir dos antieméticos a la vez.** Metoclopramida, Ondansetrón y
  Domperidona cubren lo mismo; se ofrece el que el médico haya pautado.

**Apoyo no farmacológico** (`reglas_alimentacion.md`):
5 a 6 comidas pequeñas al día, textura suave, alimentos a temperatura ambiente o
tibios, agua natural o infusión de manzanilla, y permanecer erguida 45 a 60
minutos después de comer.

---

## ACIDEZ, ARDOR, REFLUJO O GASTRITIS

| Situación | Medicamento autorizado | Referencia |
|---|---|---|
| Acidez, reflujo gastroesofágico, gastritis, úlcera | Famotidina | `medicamentos_autorizados.md` → Medicamento 7 |
| Alivio puntual de ardor o irritación gástrica | Solugastril gel oral | → Medicamento 8 |

- **Famotidina:** con o sin alimentos, respetando la pauta prescrita. Puede
  necesitar ajuste si hay enfermedad renal.
- **Solugastril:** uso puntual, **no de forma constante ni "siempre"** salvo
  indicación médica. El documento lo dice de forma expresa.
- **Alerta escondida en Medicamento 8:** si lo necesita con mucha frecuencia, o
  hay dolor persistente, vómitos, pérdida de peso, **heces negras** o dificultad
  para tragar → consultar al médico. El chatbot debe preguntar activamente por
  estos signos cuando el tema se repite.

**Apoyo:** evitar lo prohibido en `reglas_alimentacion.md` (frituras, picante,
café, té negro, cítricos muy ácidos, carbonatadas) y no acostarse tras comer.

---

## PESADEZ, LLENURA, GASES O ERUCTOS DESPUÉS DE COMER

| Situación | Medicamento autorizado | Referencia |
|---|---|---|
| Digestión pesada, gases, inflamación abdominal, eructos | Enzypride (grageas) | → Medicamento 4 |
| Pesadez acompañada de náusea o regurgitación | Domperidona (Gastroflux) | → Medicamento 9 |

- **Enzypride:** el documento **no trae dosis ni frecuencia**. El chatbot remite
  al envase o al médico, nunca propone una cantidad.

**Apoyo:** comidas fraccionadas de poco volumen, textura suave, y no acostarse
inmediatamente después de comer (`reglas_alimentacion.md`).

---

## DOLOR

| Situación | Medicamento autorizado | Referencia |
|---|---|---|
| Dolor tipo cólico o espasmo (digestivo, urinario, ginecológico) | Sertal Compuesto | → Medicamento 6 |
| Dolor general prescrito | ⚠️ **BLOQUEADO — ver conflicto abajo** | → Medicamento 1 |

- **Sertal Compuesto:** sin dosis ni frecuencia en el documento, y su composición
  varía según el país. El chatbot debe pedir ver el envase o los principios
  activos antes de dar cualquier detalle.

### ⚠️ CONFLICTO SIN RESOLVER: Paracetamol / Acetaminofén

- `medicamentos_autorizados.md` → Medicamento 1 lo autoriza como
  "Tylex 750 / Paracetamol (Acetaminofén)".
- `medicamentos_no_autorizados.md` → Medicamento 1 lo **prohíbe**:
  "Acetaminofen — Prohibido tomarla".

Es el mismo principio activo. Hasta que se aclare con el médico tratante, aplica
la **regla 2** del orden de decisión (la lista de bloqueo manda): el chatbot
responde que ese medicamento no está autorizado y pide confirmar con el médico.

Nota adicional: el Medicamento 1 tiene todos sus campos como plantilla de ejemplo
(`[Ejemplo: 500mg]`, `[Ejemplo: Cada 12 horas con comida]`). Aunque se resolviera
el conflicto, esos valores **no son datos reales** y no deben usarse para entrenar.

---

## ANSIEDAD O CRISIS DE PÁNICO

| Situación | Medicamento autorizado | Referencia |
|---|---|---|
| Trastorno de ansiedad, trastorno de pánico | Tafil / Alprazolam | → Medicamento 11 |

- Sin dosis ni frecuencia en el documento: solo la pauta del médico.
- No combinar con alcohol (además ya está prohibido en `reglas_alimentacion.md`).
- **Nunca suspender bruscamente** tras uso continuo: riesgo de abstinencia.
- Somnolencia sumada si ya tomó Difenhidramina (Med 2) o Metoclopramida (Med 3).

---

## ALERGIA, PICAZÓN O DIFICULTAD PARA DORMIR

| Situación | Medicamento autorizado | Referencia |
|---|---|---|
| Antihistamínico, o somnolencia nocturna según indicación | Difenhidramina 50 mg | → Medicamento 2 |

- 1 tableta o cápsula de 50 mg, en la noche antes de acostarse, a la misma hora.
- En adultos mayores: riesgo de confusión, caídas y retención urinaria.
- No mezclar con alcohol ni otros sedantes.
- Puede causar mareo, boca seca y visión borrosa.

---

## PRESIÓN ARTERIAL

| Situación | Medicamento autorizado | Referencia |
|---|---|---|
| Control de presión alta o insuficiencia cardíaca | Enalapril | → Medicamento 10 |

- Es de mantenimiento: **no se suspende ni se cambia la dosis** sin el médico.
- Si reporta mareo al levantarse rápido o tos seca persistente: son efectos
  conocidos, hay que reportarlos al médico, **no** suspender por cuenta propia.

---

## SÍNTOMAS SIN MEDICAMENTO EN LA LISTA

Si el usuario reporta algo que no cae en ninguna sección anterior (diarrea,
estreñimiento, mareo aislado, insomnio sin más contexto, tos, dolor de garganta,
erupción cutánea…), el chatbot **no improvisa**: responde que no hay nada
autorizado para ese síntoma y que debe consultarse al médico.

---

## RIESGOS CRUZADOS ENTRE MEDICAMENTOS AUTORIZADOS

Todos derivados de las notas médicas de `medicamentos_autorizados.md`:

| Riesgo | Medicamentos implicados |
|---|---|
| Somnolencia acumulada | Difenhidramina (2) + Metoclopramida (3) + Alprazolam (11) |
| Ritmo cardíaco / intervalo QT | Ondansetrón (5) + Domperidona (9) |
| Antieméticos duplicados | Metoclopramida (3), Ondansetrón (5), Domperidona (9) |
| Prohibición absoluta | Ondansetrón (5) **nunca** junto con apomorfina |
| Alcohol | Difenhidramina (2), Alprazolam (11) — ya prohibido en `reglas_alimentacion.md` |
| Ajuste por función renal | Famotidina (7), Enalapril (10), Domperidona (9) |

---

## HUECOS PENDIENTES ANTES DE ENTRENAR

1. Resolver el conflicto Paracetamol / Acetaminofén entre los dos documentos.
2. Rellenar nombre y teléfono del médico tratante y del hospital en
   `protocolo_emergencias.md`.
3. Completar dosis y frecuencia reales de: Tylex 750 (1), Enzypride (4),
   Ondansetrón (5), Sertal Compuesto (6), Famotidina (7), Solugastril (8),
   Enalapril (10), Tafil (11).
4. Sustituir los valores de ejemplo del Medicamento 1 por datos reales.
5. Corregir la línea de `medicamentos_no_autorizados.md` que dice
   *"Si el usuario pregunta por un medicamento NO listado aquí…"*: está copiada
   del documento de autorizados y su lógica queda invertida.
