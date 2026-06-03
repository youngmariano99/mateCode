# Manifiesto Híbrido de Restricciones del Dominio: MateCode

Este documento constituye la columna vertebral del contexto operativo de **MateCode**. Define de forma inmutable las directivas de negocio, restricciones de seguridad, pila tecnológica autorizada y convenciones semánticas. Es de obligado cumplimiento para todo agente de IA y desarrollador humano.

---

## 1. Misión Operativa y Filosofía de Producto

*   **Visión "Anti-Jira":** El sistema opera bajo una filosofía de fricción cercana a cero y revelación progresiva (progressive disclosure). El usuario solo debe ver los módulos necesarios para su espacio de trabajo activo.
*   **Estética Zen:** Interfaces minimalistas y limpias. Uso de paletas monocromáticas (Zinc/Slate) y colores de acento sutiles (Azul/Índigo) únicamente para llamadas a la acción (CTAs) o estados críticos (Verde/Éxito, Rojo/Error).
*   **Tono de Voz (Mentor):** Español latinoamericano con modismos profesionales rioplatenses (uso del "vos" para acciones directas, ej. "Configurá tu proyecto"). La UI debe explicar el porqué de los procesos y celebrar los éxitos del equipo.

---

## 2. Restricciones de Negocio y Seguridad de la Información (Arc42 - Capítulo 2)

Estas políticas son de cumplimiento regulatorio estricto y no están sujetas a renegociación técnica:

*   **Aislamiento Estricto de Datos (Multi-Tenant RLS):** Ningún servicio o consulta de base de datos puede acceder a registros de otros inquilinos. Se utiliza **Row-Level Security (RLS)** a nivel de base de datos PostgreSQL validando contra el JWT de autenticación.
*   **Prohibición de Borrados Físicos (Soft Deletes):** La ejecución del comando SQL `DELETE` está prohibida para tablas transaccionales. Toda supresión de datos requiere la mutación exclusiva del registro de marca de tiempo (`is_deleted` = true, `deleted_at` = TIMESTAMP) o banderas lógicas (`activo` = false).
*   **Flexibilidad de Modelado sin EAV:** Los campos de datos dinámicos (parámetros de formularios, criterios BDD, tareas de tickets) se almacenan estrictamente como columnas de tipo `JSONB` con índices GIN en PostgreSQL. Queda prohibido el patrón Entidad-Atributo-Valor.
*   **Ordenamiento de Tableros O(1):** Prohibido actualizar múltiples filas al mover tarjetas en el Kanban. El ordenamiento en el cliente y backend se realiza exclusivamente mediante cadenas de ordenación lexicográfica (`rango_lexicografico`).
*   **Autenticación M2M (Máquina a Máquina):** La invocación de APIs internas demanda tokens JWT firmados asimétricamente con vigencia máxima de 15 minutos. El acceso de clientes externos se realiza mediante enlaces cifrados seguros de un solo uso (Magic Links UUID).

---

## 3. Pila Tecnológica Autorizada

La incorporación de nuevas dependencias requiere la aprobación documentada a través de un Architecture Decision Record (ADR).

### Capa de Presentación (Frontend)
*   **Framework principal:** React 18+ (Vite) en TypeScript.
*   **Estilos:** Tailwind CSS (cero archivos `.css` o `.scss` personalizados).
*   **Lienzos y Diagramación:** React Flow (`xyflow`) integrado con ElkJS o Dagre para distribución automática de nodos.
*   **Componentes base:** Radix UI y shadcn/ui.
*   **Drag & Drop (Kanban):** Pragmatic Drag and Drop (Atlassian). Prohibido utilizar `react-beautiful-dnd`.
*   **Formularios:** React Hook Form y SurveyJS (cargado mediante Lazy-Loading para formularios dinámicos del CRM).

### Capa de Servicios y API (Backend)
*   **Framework principal:** .NET 8/9 (C#) aplicando Clean Architecture de forma estricta.
*   **Acceso a Datos:** Entity Framework Core conectado a PostgreSQL con inyección del contexto Tenant.
*   **Notificaciones:** Novu (SDK `novu-dotnet` en backend y componentes Inbox en React).
*   **Orquestación de IA:** Microsoft Semantic Kernel (SK) con motor de plantillas Scriban para compilar prompts en memoria con cero asignación (zero-allocation). Ollama para despliegues de modelos locales de lenguaje.

---

## 4. Convenciones Semánticas de Estructuración y Código

*   **Tipografía de Nombres (Casing):**
    *   Modelos de dominio y Entidades: `PascalCase`.
    *   Variables, métodos, parámetros y controladores: `camelCase`.
    *   Constantes y variables de entorno: `UPPER_SNAKE_CASE`.
*   **Gestión Determinista de Excepciones:** Prohibido lanzar excepciones genéricas (`throw new Exception()`). Toda anomalía lógica debe encapsularse en excepciones de negocio tipadas derivadas de una clase base (ej. `DomainException`).
*   **Límites de Código y SRP:** Límite máximo ideal de 200-250 líneas por archivo. SRP estricto: un archivo contiene una sola clase, interfaz o componente de React. En React, la lógica compleja de eventos debe extraerse a Custom Hooks independientes.
*   **Named Exports:** El frontend de React debe utilizar exportaciones con nombre (`Named Exports`) de manera exclusiva para garantizar búsquedas deterministas de símbolos en el AST y facilitar refactorizaciones seguras. Quedan prohibidas las exportaciones por defecto (`export default`).
*   **Idioma de Código (Spanglish Técnico):** Los nombres de variables, funciones y tablas de base de datos se escriben en Español. Las palabras clave de lenguaje y sufijos de arquitectura se escriben en Inglés para mantener el estándar.
    *   *Ejemplos correctos:* `UsuarioController`, `ClienteRepository`, `obtenerProyectosActivos()`, `created_at`, `deleted_at`.
