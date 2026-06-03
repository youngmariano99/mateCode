# Arquitectura Arc42 - Sección 2: Restricciones del Sistema

Este documento recopila las restricciones técnicas, de diseño de base de datos, rendimiento de interfaz de usuario y regulatorias que limitan el diseño de **MateCode**.

---

## 1. Restricciones Técnicas y de Rendimiento

*   **Límites de Renderizado en Kanban:** Para asegurar una UI reactiva en milisegundos y evitar reconciliaciones masivas de DOM en React al mover tarjetas en tableros con más de 100 tickets, se prohíbe el uso de layouts pesados. Se exige el uso exclusivo de `@atlaskit/pragmatic-drag-and-drop` con lógica de reordenamiento lexicográfico O(1).
*   **Rendimiento del Entorno 3D (Spatial OS):** El renderizado tridimensional interactivo de oficinas con React Three Fiber (R3F) debe implementarse mediante carga perezosa (`Lazy Loading` y `Suspense`). El motor 3D solo se inicializará bajo demanda táctil o clic del usuario para prevenir degradaciones de rendimiento y bloqueos del navegador en dispositivos de gama baja.
*   **Límites del Tamaño de Archivos (Principio Anti-Monolito):** Ningún archivo de código fuente (`.cs`, `.tsx`, `.ts`) debe superar las 200-250 líneas. Las funciones complejas y manejadores de eventos deben desacoplarse de forma inmediata mediante técnicas de *Extraer Método* (backend) y *Custom Hooks* (frontend).

---

## 2. Restricciones de Persistencia y Seguridad (Base de Datos)

*   **Multitenancy Infranqueable (RLS):** Queda prohibida la ejecución de consultas que no estén encapsuladas bajo el contexto de seguridad del inquilino. Supabase inyecta el `tenant_id` a nivel de fila (Row-Level Security), y Entity Framework aplica Global Query Filters para asegurar que las consultas del backend aíslen transparentemente los datos de cada espacio de trabajo.
*   **Inmutabilidad Transaccional:** Prohibido el uso de la cláusula SQL `DELETE` en tablas de tickets, historias y sprints. Todo borrado debe ser lógico, actualizando banderas de estado (`activo = false` o `is_deleted = true`, `deleted_at = TIMESTAMP`) para evitar roturas de claves foráneas y mantener la trazabilidad de cambios para auditorías.
*   **Evitar EAV (Entidad-Atributo-Valor):** La flexibilidad de almacenamiento de formularios del CRM y criterios de aceptación BDD se implementa mediante el uso exclusivo de columnas de tipo `JSONB` indexadas mediante índices GIN en PostgreSQL, previniendo el crecimiento desmedido de tablas de atributos planos.
