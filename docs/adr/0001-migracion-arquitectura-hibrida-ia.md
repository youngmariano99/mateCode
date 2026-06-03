# ADR-0001: Migración a la Arquitectura de Documentación Híbrida "AI-First"

## Status

Aceptado

## Contexto

El desarrollo del proyecto MateCode involucra la interacción constante con inteligencias artificiales generativas para la creación de código, refactorizaciones y auditorías. La documentación tradicional orientada a humanos introduce una latencia cognitiva severa en las IAs (conocida como "impuesto de tokens" por inyección indiscriminada de reglas globales) y produce dilución semántica en los motores de indexación y recuperación vectorial (RAG) debido a la redundancia en archivos extensos y fragmentados.

Se requiere un estándar que optimice el uso de la ventana de contexto del modelo de lenguaje sin degradar la experiencia de onboarding de desarrolladores humanos.

## Decisión

Adoptar formalmente el estándar de **Arquitectura de Documentación Híbrida "AI-First"**, estructurando la base de conocimiento en la raíz del proyecto y bajo el subdirectorio `docs/`:

1.  **Descubrimiento y Entrypoint:** Crear `llms.txt` y `llms-full.txt` en la raíz del monorepo como índice determinista para agentes.
2.  **Manifiesto de Restricciones:** Centralizar reglas duras inmutables del dominio en `CONTEXT.md`.
3.  **Inferencia Asimétrica:** Implementar archivos configurables Markdown (`.cursor/rules/*.mdc`) en el IDE para inyección condicional basada en globs.
4.  **Aislamiento del Conocimiento (Diátaxis + Arc42):** Organizar la documentación humana en `docs/architecture/` (Arc42 modificado), `docs/adr/` (ADRs de Michael Nygard), `docs/how-to/` (guías orientadas a objetivos), y `docs/tutorials/` (onboarding y aprendizaje).
5.  **Preservación Histórica:** Mover la documentación de los sprints iniciales y los 20 archivos de módulos individuales a la carpeta `docs/historico/` para su archivado, previniendo su indexación RAG activa pero conservando el historial.

## Consecuencias

*   (+) Reducción drástica del consumo de tokens al inyectar únicamente las reglas del contexto relevante del archivo en edición (vía globs de archivos `.mdc`).
*   (+) Prevención de alucinaciones del modelo gracias al anclaje semántico de términos y eliminación de pronombres ambiguos en la documentación de referencia.
*   (+) Rápido onboarding de nuevos programadores al segregar las guías en cuadrantes lógicos (Diátaxis).
*   (-) Requiere mantenimiento manual de los enlaces y la sintaxis estructurada YAML/XML en las reglas del IDE.
*   (-) Mayor cantidad de archivos distribuidos bajo el directorio `docs/` en comparación con una wiki tradicional consolidada.
