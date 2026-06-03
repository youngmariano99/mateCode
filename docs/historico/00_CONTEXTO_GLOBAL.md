# CONTEXTO GLOBAL DEL PROYECTO: "Anti-Jira"

## 1. Visión y Filosofía del Producto
* **Definición:** Sistema de gestión de proyectos tecnológicos modular, escalable y de extrema eficiencia.
* **Filosofía "Anti-Jira":** Fricción cercana a cero. Diseño basado en la "revelación progresiva" (progressive disclosure). El usuario final solo ve los módulos que necesita para su espacio de trabajo activo. 
* **UX/UI:** Interfaces de usuario reactivas en milisegundos. Prohibida la sobrecarga cognitiva.

## 2. Stack Tecnológico Estricto
La IA debe generar código EXCLUSIVAMENTE utilizando estas tecnologías y sus mejores prácticas modernas:
* **Frontend:** React (versión 18+). Uso de Functional Components y Hooks.
* **Backend:** .NET 8/9 (C#). [cite_start]Rendimiento I/O asíncrono y control de memoria de bajo nivel[cite: 8].
* **Base de Datos:** PostgreSQL. 

## 3. Arquitectura y Patrones (Innegociable)
El código generado debe adherirse estrictamente a la Clean Architecture (Arquitectura en Cebolla) y a los Principios SOLID. 

Para mantener la máxima eficiencia de lectura/escritura y evitar la degradación de contexto de la IA, se DEBEN implementar los siguientes patrones de diseño de manera obligatoria cuando el caso lo amerite:

* **Patrones Creacionales:** * Usar **Factory Method** o **Abstract Factory** para el nacimiento de objetos complejos. NUNCA instanciar clases con lógica compleja directamente en los controladores o servicios de aplicación.
* **Patrones Estructurales:** * Usar **Decorator** o **Proxy** para agregar comportamientos transversales (como logging, validaciones o caché) SIN modificar el código de la clase original (cumpliendo el principio Open/Closed).
* **Patrones de Comportamiento:** * Usar **Strategy** o **State** para eliminar bloques masivos de `if/else` o `switch`. Si una entidad cambia de comportamiento según su estado (ej. un Ticket pasa de "To Do" a "Done"), encapsular esa lógica en clases de estado separadas. NUNCA crear métodos de 200 líneas controlando el flujo.


## 4. Librerías y Dependencias Aprobadas
NO utilizar alternativas a menos que se solicite explícitamente.
* [cite_start]**Pizarras y Diagramas (ERD, UML):** React Flow (`xyflow`)[cite: 42]. [cite_start]Para autodisposición usar ElkJS o Dagre asíncrono[cite: 51].
* **Drag & Drop (Kanban):** Pragmatic Drag and Drop (Atlassian). [cite_start]Prohibido usar `react-beautiful-dnd`[cite: 59, 65].
* [cite_start]**Formularios:** React Hook Form (para UI estática) [cite: 89, 103] [cite_start]y SurveyJS (cargado vía Lazy-Loading, esquema basado en JSONB) para recolección de requisitos dinámicos[cite: 104, 105].
* [cite_start]**Notificaciones:** Novu (SDK `novu-dotnet` en el backend y `<Inbox />` en React)[cite: 122, 126].
* [cite_start]**Simulación IA y Prompts:** Microsoft Semantic Kernel (SK) con motor de plantillas Scriban para orquestación en C#[cite: 141, 143]. [cite_start]Ollama para modelos locales (Llama 3 / Phi-3)[cite: 147]. [cite_start]ML.NET para clasificación taxonómica ligera[cite: 152].

## 5. Reglas Duras y Restricciones (ANTI-ALUCINACIONES)
* **Regla 1:** NUNCA generes código con "sobreingeniería". Si un problema se resuelve con una función pura, no crees una clase compleja.
* **Regla 2:** NUNCA asumas el modelo de base de datos. Consulta siempre el archivo `01_MODELO_DE_DATOS.md` antes de escribir consultas SQL, repositorios o controladores.
* **Regla 3:** Las interacciones del tablero Kanban no deben desencadenar ciclos forzados de reconciliación visual masiva en React.
* **Regla 4:** Todo el código backend debe ser asíncrono (`async/await`) desde el controlador hasta el repositorio.

## 6. LÍMITES DE ARCHIVO Y REGLA "ANTI-MONOLITO" (IMPORTANTE)
Para garantizar la mantenibilidad y evitar errores en la generación de código:
* **Principio de Responsabilidad Única a Nivel Archivo:** Cada archivo debe contener UNA sola clase, UNA sola interfaz o UN solo componente.
* **Límite de Líneas:** Ningún archivo (ya sea `.cs`, `.tsx` o `.ts`) debe superar idealmente las 200-250 líneas de código.
* **Desacoplamiento Estricto:** Si un componente de React o un servicio de .NET crece demasiado, SE DEBE abstraer inmediatamente usando Custom Hooks (en React) o Servicios/Patrones de Diseño (en .NET) en archivos separados. NUNCA consolidar múltiples interfaces, tipos o implementaciones en un mismo documento.

## 7. Convenciones de Nomenclatura y Lenguaje de Código
Para garantizar la mantenibilidad y reducir la carga cognitiva al leer el código, la IA DEBE escribir las "tripas" del sistema bajo las siguientes reglas idiomáticas:

* **Idioma Principal:** Español (Latinoamericano). Los nombres de variables, funciones, clases, tablas de base de datos y columnas deben ser descriptivos y en español.
  * *Bien:* `obtenerProyectosActivos()`, `class GestorDePresupuestos`, `tabla_usuarios`.
  * *Mal:* `getActiveProjects()`, `class BudgetManager`, `users_table`.
* **Excepción Técnica (Spanglish Permitido):** Las palabras clave de los lenguajes, convenciones de frameworks y sufijos de patrones de diseño DEBEN mantenerse en inglés para no romper los estándares globales de desarrollo.
  * *Ejemplos permitidos:* `UsuarioController` (en vez de ControladorUsuario), `useProyectosHook`, `ClienteRepository`, `id`, `created_at` (o `fecha_creacion`).
* **Claridad antes que brevedad:** Prohibido usar abreviaturas incomprensibles. 
  * *Bien:* `cantidadDeTicketsCompletados`.
  * *Mal:* `cantTcksCmpl`.
* **Comentarios en el Código:** Si la IA debe dejar un comentario explicando una lógica compleja (ej. un algoritmo de ordenamiento lexicográfico), el comentario debe estar redactado en español amigable y directo.