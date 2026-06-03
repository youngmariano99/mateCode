# 04_FLUJO_DE_TRABAJO_IA: Procedimiento Operativo Estricto

## OBJETIVO Y USO DEL ARCHIVO
Este documento es el **PUNTO DE ENTRADA ÚNICO**. Cada vez que el usuario inicie una petición para construir, editar o eliminar código (referenciando este archivo, ej: `@04_FLUJO_DE_TRABAJO_IA.md`), la IA DEBE ejecutar este algoritmo exacto.

## 🛑 REGLA SUPREMA: PROHIBIDO INVENTAR (Anti-Alucinaciones)
Todo lo que la IA genere DEBE tener un respaldo en la documentación o en las instrucciones del usuario. 
* **Si falta contexto**, si un requerimiento es ambiguo, o si no se encuentran los archivos pertinentes referenciados: **LA IA SE DETIENE**.
* NO asumas decisiones de negocio o arquitectura.
* NO inventes código de relleno para que "funcione".
* **Acción Requerida:** La IA debe devolver un listado claro de preguntas o generar una plantilla llamada `CUESTIONARIO_DUDAS.md` para que el usuario la llene. Solo se avanzará cuando el usuario resuelva esas dudas.

---

## PASO 1: Ingestión de Contexto (OBLIGATORIO)
Antes de proponer una sola línea de código, la IA debe leer en silencio y asimilar la arquitectura del proyecto.
* **Siempre:** Leer `00_CONTEXTO_GLOBAL.md` y `01_MODELO_DE_DATOS.md`.
* **Si la tarea es Frontend:** Leer `02_SITEMAP_Y_RUTAS.md` y `03_DISENO_Y_UX.md`.
* **Validación Arquitectónica:** Si la IA detecta que la petición del usuario contradice estos documentos (ej. pide usar `Redux` cuando la regla es no usar estados globales pesados), DEBE advertir al usuario sobre la violación de la arquitectura antes de proceder.

## PASO 2: Planificación y Confirmación
La IA no debe escupir 500 líneas de código de una vez.
1. Debe enumerar brevemente (en viñetas) qué archivos va a crear o modificar.
2. Debe validar mentalmente que ninguna de estas modificaciones rompa los Principios SOLID, la Arquitectura Limpia, o el enrutamiento.
3. Debe confirmar qué Patrón de Diseño (si aplica) va a utilizar.

## PASO 3: Ejecución Estricta (Reglas de Código y Calidad)
La IA debe programar adhiriéndose estrictamente a los siguientes estándares de ingeniería:

* **Arquitectura y Diseño:**
  * Implementar **Arquitectura Limpia (Clean Architecture)** separando claramente dominio, aplicación, infraestructura y presentación.
  * Aplicar **Principios SOLID** en cada entidad, servicio o componente creado.
  * Utilizar **Patrones de Diseño** (Creacionales, Estructurales y de Comportamiento) donde la lógica lo justifique (ej. Factory, Strategy, Observer).

* **Clean Code y Refactorización (Evitar Code Smells):**
  * **Nomenclatura Pobre:** Renombrar variables para que revelen su intención inmediatamente (en Español).
  * **Funciones Enormes:** Aplicar técnica de *Extraer Método*. Ninguna función debe hacer más de una cosa.
  * **Exceso de Anidamiento:** Utilizar *Cláusulas de Guarda (Guard Clauses)* para retornos tempranos y evitar múltiples niveles de `if/else`.
  * **Comentarios Obvios:** El código debe ser *Autodocumentado*. Solo comentar lógica matemática compleja o decisiones de negocio inusuales.
  * **Booleanos como Parámetros:** Eliminar "Flag Arguments". Dividir la función en dos funciones con intención separada y clara.
  * **Larga Lista de Parámetros:** Utilizar *Agrupación de Objetos (Introduce Parameter Object)*.
  * **Código Muerto:** Eliminar variables, imports y métodos no utilizados.

* **Reglas Estructurales del Proyecto:**
  * Aplicar el límite de ~250 líneas por archivo. Dividir en módulos más pequeños si es necesario (Custom Hooks, Servicios separados).
  * Mantener nombres de variables y tablas EXACTAMENTE como figuran en el `01_MODELO_DE_DATOS.md` y respetar el idioma Español definido en el Contexto Global.

## PASO 4: Micro-Documentación Posterior (El "Anti-Testamento")
Para mantener un registro eficiente sin caer en la sobre-documentación inútil, una vez finalizada la tarea, la IA DEBE actualizar el archivo `HISTORIAL_CAMBIOS.md` (ubicado en la raíz de `/docs`) utilizando EXCLUSIVAMENTE el siguiente formato ultra-resumido:

**Formato Estricto de Registro (Máximo 4 líneas por cambio):**
* **Fecha:** [YYYY-MM-DD]
* **Módulo/Tarea:** [Ej: Auth / Formulario Fase 0]
* **Archivos Tocados:** `[lista rápida de archivos .cs o .tsx]`
* **Qué y Por Qué (1 oración clara):** "Se abstrajo el componente X a un Hook para reutilizarlo en la Fase 3, se agregó tabla Y al modelo para cumplir con Z".

**PROHIBIDO:** Escribir párrafos largos, explicaciones filosóficas de por qué se hizo el código o tutoriales paso a paso en el registro de cambios. Ir directo al grano.