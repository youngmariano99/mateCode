# Especificación de Referencia: Módulos de Negocio MateCode

Este documento recopila la síntesis técnica, funcional y de persistencia de los 20 módulos de negocio del sistema operativo de proyectos **MateCode**.

---

## 1. Módulo: Autenticación, Usuarios y Permisos
*   **Archivos Históricos:** `auth_y_usuarios.md`
*   **Propósito:** Proporcionar registro, inicio de sesión y validación de permisos granulares por inquilino.
*   **Persistencia:** Tabla `nucleo.usuarios`, `nucleo.espacios_trabajo`, `nucleo.miembros_espacio`.
*   **Funcionalidades:**
    *   Auth asíncrona validada con JWT ECC P-256 de Supabase.
    *   Matriz de permisos almacenada en `JSONB` que activa/desactiva botones y secciones de la interfaz.
    *   Filtro global por `tenant_id` integrado en consultas EF Core para asegurar multitenancy.

---

## 2. Módulo: Captura de Leads y CRM
*   **Archivos Históricos:** `crm_y_portal_cliente.md`
*   **Propósito:** Gestión de contactos externos y bandeja de entrada de oportunidades comerciales.
*   **Persistencia:** Tabla `crm.clientes` con la columna `contexto_json`.
*   **Funcionalidades:**
    *   Bandeja de Leads calificados bajo el marco BANT.
    *   Aprobación de Leads que transforma el contacto en cliente y crea el proyecto en el stepper automáticamente.
    *   Visualización resumida de KPIs comerciales.

---

## 3. Módulo: Formulario de Calificación e Inyección
*   **Archivos Históricos:** `fase_0_factibilidad.md`
*   **Propósito:** Encuestas interactivas inyectables en sitios web externos.
*   **Persistencia:** Tabla `crm.formularios_plantilla` con la configuración del cuestionario en `JSONB`.
*   **Funcionalidades:**
    *   Renderizado rápido de SurveyJS en `/form/[template_id]` dentro de un Iframe limpio.
    *   Carga diferida (lazy loading) del plugin de encuestas para optimizar la velocidad.
    *   Persistencia de respuestas inyectadas directamente en la base de datos de leads.

---

## 4. Módulo: User Story Mapping 2D
*   **Archivos Históricos:** `fase_1_requisitos.md`, `MODULO_USER_STORY_MAPPING.md`
*   **Propósito:** Lienzo bidimensional para estructurar las historias y metas de negocio.
*   **Persistencia:** Tabla `agil.epicas`, `agil.historias` (relacionadas al ID de proyecto).
*   **Funcionalidades:**
    *   Tablero 2D de Epics (Backbone), Features (Narrativa) y Releases (Swimlanes).
    *   Integración de "Panning" (arrastre para desplazamiento espacial) en tablas extensas.
    *   Sincronización bidireccional instantánea (Live Sync) entre el editor JSON y la interfaz visual.

---

## 5. Módulo: Refinamiento BDD y Criterios
*   **Archivos Históricos:** `fase_1_requisitos.md`
*   **Propósito:** Definir los alcances y criterios de aceptación técnicos bajo metodología ágil.
*   **Persistencia:** Columna `epicas.criterios_bdd` (`JSONB`).
*   **Funcionalidades:**
    *   Interfaz visual `BddEditorPanel.tsx` para redactar en formato "Dado que / Cuando / Entonces".
    *   Placeholders interactivos y tooltips educativos para guiar a perfiles junior.
    *   Validación y persistencia no-destructiva (Smart Merge) para evitar sobreescritura de cambios.

---

## 6. Módulo: Diagramador ERD y Sitemap
*   **Archivos Históricos:** `fase_2_diseno.md`, `12_MODULO_ERD_UNIVERSAL.md`, `13_MODULO_SITEMAP_BRANDING.md`
*   **Propósito:** Lienzo interactivo de diagramas lógicos de base de datos y flujos de navegación.
*   **Persistencia:** Tabla `proyectos.proyectos` (campo `contexto_json` con esquemas y diagramas).
*   **Funcionalidades:**
    *   Renderizado en React Flow de archivos DBML (Database Markup Language).
    *   Cálculo automático de la caja delimitadora (Bounding Box) para exportar a PNG/SVG sin recortes.
    *   Sincronización bidireccional entre el editor de texto y los nodos gráficos.

---

## 7. Módulo: Presupuestos y Cotizador
*   **Archivos Históricos:** `cotizacion_y_presupuestos.md`
*   **Propósito:** Wizard interactivo para generar presupuestos y propuestas de cobro.
*   **Persistencia:** Entidades `PerfilEmpresa` y `Presupuesto` del esquema de finanzas.
*   **Funcionalidades:**
    *   Cálculos financieros automáticos aislados en Custom Hook.
    *   Generación en el navegador de archivos PDF con perfiles multi-marca de la agencia.
    *   Traducción automatizada de requerimientos técnicos a ítems comerciales para el cliente.

---

## 8. Módulo: Tablero Kanban de Alto Rendimiento
*   **Archivos Históricos:** `fase_3_kanban.md`
*   **Propósito:** Centralización de tareas de desarrollo de alta velocidad.
*   **Persistencia:** Tabla `agil.tickets`.
*   **Funcionalidades:**
    *   Drag and drop optimista basado en `@atlaskit/pragmatic-drag-and-drop`.
    *   Ordenamiento lexicográfico O(1) con cadenas de texto (`rango_lexicografico`).
    *   Inicialización automática de columnas ("Por Hacer", "En Progreso", etc.) en nuevos proyectos.

---

## 9. Módulo: Planificación de Sprints y Métricas
*   **Archivos Históricos:** `14_MODULO_BACKLOG_Y_SPRINTS.md`
*   **Propósito:** Orquestación de sprints de desarrollo e historial de entregas.
*   **Persistencia:** Tabla `agil.sprints`, `agil.metricas_sprint`.
*   **Funcionalidades:**
    *   Simulación de sprints históricos configurando fechas de inicio manuales.
    *   Modal obligatorio de cierre con Cycle Time automático y triage de tareas pendientes.
    *   Indicadores gráficos de velocidad y eficiencia del equipo.

---

## 10. Módulo: Motor de Prompts Mágicos
*   **Archivos Históricos:** `bibliotecaPromps.md`, `05_MOTOR_DE_PROMPTS.md`
*   **Propósito:** Compilación de contexto para asistir a desarrolladores IAs.
*   **Persistencia:** Tabla `boveda.plantillas_prompt`.
*   **Funcionalidades:**
    *   Plantillas Scriban en C# compiladas con cero asignación en memoria (zero-allocation).
    *   Inyección agregada de ADN de proyecto, diagramas ERD, criterios BDD e intenciones del usuario.
    *   Botón inmersivo "Prompt Mágico" en tarjetas del Kanban que copia el texto al portapapeles.

---

## 11. Módulo: Spatial OS (Mapa 3D/2D)
*   **Archivos Históricos:** `17_MIGRACION_SPATIAL_OS.md`, `21_MIGRACION_WORKSPACE_Y_MAPA.md`
*   **Propósito:** Entorno inmersivo de oficinas que reemplaza la navegación tradicional por URLs.
*   **Persistencia:** Centralizada en `useWorkspaceStore` (Zustand) y coordenadas de base de datos.
*   **Funcionalidades:**
    *   Vista interactiva dual (Mapa 2D con regiones poligonales y 3D con React Three Fiber).
    *   Paneles modales Glassmorphism integrados sobre el mapa interactivo.
    *   Pantalla de carga ultra-realista PBR (ritual de cebado de mate en SVG).

---

## 12. Módulo: Presencia en Tiempo Real
*   **Archivos Históricos:** `16_MODULO_VIRTUAL_HQ.md`
*   **Propósito:** Visualizar a los compañeros de equipo en las salas virtuales.
*   **Persistencia:** Sincronización volátil mediante Sockets.
*   **Funcionalidades:**
    *   Conexiones persistentes SignalR de .NET unificadas en `PresenceContext.tsx` de React.
    *   Interpolación suave de avatares en coordenadas espaciales.
    *   Buscador "LoL-Style" para invitar a nuevos miembros del equipo.

---

## 13. Módulo: Centro de Mando (Sala de Guerra)
*   **Archivos Históricos:** `20_COMMAND_CENTER_ROADMAP.md`
*   **Propósito:** Auditoría del proyecto y salas síncronas de votación.
*   **Persistencia:** Tabla `agil.client_feedback` y actas guardadas en `JSONB`.
*   **Funcionalidades:**
    *   Votaciones y encuestas en vivo con resultados instantáneos (SignalR).
    *   Logs técnicos cinematográficos y consola interactiva de auditoría.
    *   Dossier de actas y decisiones persistidas para cumplimiento corporativo.

---

## 14. Módulo: Biblioteca y Bóveda (Vault)
*   **Archivos Históricos:** `crecimiento_y_boveda.md`
*   **Propósito:** Gestionar y guardar los artefactos y configuraciones para futuros proyectos.
*   **Persistencia:** Tabla `boveda.plantillas_stack`, `boveda.tecnologias_catalogo`, `boveda.estandares_catalogo`.
*   **Funcionalidades:**
    *   Wizard de cosecha interactivo al cerrar proyectos.
    *   Importación con un solo clic de stacks, diagramas y formularios guardados.
    *   Catálogo global con borrado lógico (`activo = false`) para evitar inconsistencias en proyectos previos.

---

## 15. Módulo: Testing y Deuda Técnica
*   **Archivos Históricos:** `fase_4_y_5_testing_y_despliegue.md`
*   **Propósito:** Ejecución de pruebas y reporte inmediato de incidencias técnicas.
*   **Persistencia:** Tabla `agil.tickets` (creación de Bugs) y casos de prueba en `JSONB`.
*   **Funcionalidades:**
    *   Checklist interactivo de testing generado automáticamente a partir de criterios BDD.
    *   Inyección automatizada de tickets de tipo Bug en el Kanban ante fallos de prueba.
    *   Registro del historial de pruebas asociadas a historias de usuario específicas.

---

## 16. Módulo: Laboratorio y Prototipado
*   **Archivos Históricos:** `moduloLaboratorio.md`
*   **Propósito:** Sandbox interactivo para pruebas de algoritmos de prompts e integraciones de IA local.
*   **Funcionalidades:**
    *   Pruebas aisladas del orquestador Microsoft Semantic Kernel.
    *   Simulación de integraciones de LLM mediante Ollama local.

---

## 17. Módulo: Migración de Componentes
*   **Archivos Históricos:** `19_GUIA_MIGRACION_COMPONENTES.md`
*   **Propósito:** Estándares para mover layouts antiguos de Vite al entorno inmersivo de Spatial OS.
*   **Funcionalidades:**
    *   Procedimiento de desmontado de Sidebar y adición a la TopBar de proyectos.
    *   Uso de `apiClient.ts` centralizado para peticiones y headers dinámicos.

---

## 18. Módulo: Importación Express de Proyectos
*   **Archivos Históricos:** `20_MODUO_IMPORT_PROYECTO.md`
*   **Propósito:** Cargar rápidamente proyectos previos para poblar la sección de Portafolio.
*   **Funcionalidades:**
    *   Formularios directos sin pasar por el stepper del proyecto.
    *   Inserción simplificada en la base de datos de proyectos.

---

## 19. Módulo: Portafolio de la Agencia
*   **Archivos Históricos:** `crecimiento_y_boveda.md`
*   **Propósito:** Exposición de proyectos finalizados para marketing comercial.
*   **Funcionalidades:**
    *   Mapeo de proyectos marcados como "desplegados" en el stepper.
    *   Exposición en layouts de Netlify limpios configurados para indexación SEO.

---

## 20. Módulo: Colaboración en DevHub
*   **Archivos Históricos:** `15_MODULO_COLABORACION_DEVHUB.md`
*   **Propósito:** Salas de reunión interactiva de desarrolladores síncrona.
*   **Funcionalidades:**
    *   Paneles laterales compartidos de documentación técnica.
    *   Herramientas de dibujo en pizarra en conjunto sincronizadas por SignalR.
