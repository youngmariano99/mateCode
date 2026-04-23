# Especificación Técnica: Módulo "El Laboratorio" (Gestor de Impacto y Trazabilidad)

## 1. Visión General
"El Laboratorio" es un módulo transversal diseñado para capturar Imprevistos (Ideas, Bugs, Cambios). Dado que el sistema opera con un motor de "Prompt Generation" (IA Externa), el flujo se basa en generar prompts para que herramientas como Claude/GPT estructuren la información y devuelvan JSONs que nuestro frontend parsea automáticamente. Además, el módulo cuenta con memoria histórica impulsada por Búsqueda Full-Text en PostgreSQL.

## 2. Base de Datos (PostgreSQL)
Se requieren tres tablas con Soft Delete (`eliminado_en`) y Políticas RLS por Tenant.

1. `agil.laboratorio_entradas`:
   - Campos: `id`, `proyecto_id`, `tipo` (Idea, Bug, Cambio), `titulo`, `descripcion_corta`, `contexto_estructurado_json`, `estado` (Borrador, En_Revision, Aprobado, Rechazado), `creado_por`, `creado_en`, `eliminado_en`.
2. `agil.laboratorio_feedback`:
   - Campos: `id`, `entrada_id`, `usuario_id`, `reaccion` (Aprobacion, Rechazo, Nota), `comentario` (Obligatorio si es Rechazo), `creado_en`.
3. `boveda.lecciones_aprendidas` (Memoria Histórica):
   - Campos: `id`, `tenant_id`, `tipo_registro`, `titulo`, `solucion_json`, `vector_busqueda` (tipo `tsvector`).
   - Requiere: Un Trigger en PostgreSQL que actualice automáticamente el `vector_busqueda` concatenando el título y la solución (usando `to_tsvector`).

## 3. Lógica de Backend (C# .NET)

### 3.1 Motor de Similitudes (Full-Text Search)
- **Endpoint:** `GET /api/Lab/similar?query={texto}`
- **Lógica:** Usar Entity Framework (`EF.Functions.ToTsQuery` o compatibilidad de búsqueda full-text) para buscar la query en la tabla `lecciones_aprendidas`. Debe ser rápido para soportar un "debounce" desde el frontend.

### 3.2 El Súper Prompt Maestro de Impacto
- **Servicio:** `PromptEngineService.GenerarSuperMasterPromptAsync(proyectoId, entradaLabId)`
- **Lógica:** Debe recolectar todo el contexto del proyecto de TODAS las fases:
  - Fase 0 (ADN, Stack, Estándares).
  - Fase 1 (Requisitos / Historias).
  - Fase 2 (Diagramas existentes).
  - Fase 3 (Tickets activos).
  - Fase 4 (Testing).
- **Salida:** Si una fase está vacía, debe incluir el encabezado y el texto "(Sin información relevante)". El prompt generado debe pedirle a la IA externa que evalúe la entrada del laboratorio contra este Súper Contexto y devuelva: 1) Cambios conceptuales, 2) Código actualizado, y 3) Un JSON de tickets nuevos a crear.

## 4. UI/UX Frontend (React + Tailwind + SweetAlert2)

### 4.1 Quick Capture y Búsqueda en Vivo
- Input superior prominente. Al tipear (con debounce de 300ms), llama al endpoint `/similar`.
- Si hay coincidencias, despliega un dropdown flotante: *"💡 Tal vez ya solucionaste este error: [Lista]"*.

### 4.2 Flujo Estructurador (Copiar y Pegar JSON)
- Al abrir una Entrada, en lugar de autocompletar con IA nativa, existen dos recuadros:
  1. Botón **[🧠 Obtener Prompt Estructurador]**: Copia al portapapeles la instrucción exacta para ChatGPT.
  2. Textarea **[Pegar respuesta JSON de la IA]**: El usuario pega el JSON devuelto por ChatGPT. El sistema hace un `JSON.parse()` e inyecta los datos en la vista visual de la Entrada.

### 4.3 Panel de Feedback y Auditoría
- Reacciones tipo "Like/Dislike". Si el usuario marca "Rechazo", se fuerza la apertura de un SweetAlert2 para introducir el motivo (Comentario obligatorio).
- Solo el usuario `creado_por` puede aplicar Soft Delete (botón oculto para el resto).