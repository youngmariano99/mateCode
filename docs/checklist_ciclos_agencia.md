# Checklist de Ciclos: Gestión de Agencia, Clientes y Proyectos Web

Este documento sirve para el seguimiento progresivo de la implementación de las nuevas características de la agencia. Iremos marcando con checks cada ciclo individualmente a medida que avancamos.

---

## 📋 Estado de Ciclos de Trabajo

- [x] **Ciclo 1: Perfil de Empresa/Agencia, Branding y Redes Sociales**
  - [x] Agregar columnas en la base de datos para redes, colores, misión, visión y datos de marketing.
  - [x] Actualizar la entidad `Agencia` y el mapeo en `AppDbContext` (C#).
  - [x] Implementar endpoint `PUT api/Agency/{id}/profile` (C#).
  - [x] Agregar acción `updateAgencyProfile` en `useAgencyStore` (Zustand).
  - [x] Crear la pestaña "Perfil & Identidad" en la administración de la Agencia (`AgencyDashboard`).
  - [x] Integrar campos de marca (logotipo, colores, tipografía) y redes sociales en el formulario.

- [x] **Ciclo 2: Centralización de Clientes y Formularios de Entrada**
  - [x] Modificar la entidad `Cliente` para enlazarla a `AgenciaId` y hacer opcional `EspacioTrabajoId`.
  - [x] Mudar el flujo de Formularios y Enlace Mágico para que se controlen desde la Agencia.
  - [x] Diseñar el panel CRM de Clientes a nivel de Agencia.
  - [x] Agregar selector de Clientes de la Agencia al crear proyectos en Espacios de Trabajo.

- [x] **Ciclo 3: Caja de Herramientas y Contratos Digitales**
  - [x] Agregar tipo `"herramienta"` con filtros de etiquetas en la biblioteca de recursos.
  - [x] Crear la entidad `ContratoAgencia` con estados (Borrador, Enviado, Firmado) en base de datos.
  - [x] Diseñar interfaz de visualización de Contratos y panel para Firma Digital interactiva.

- [x] **Ciclo 4: Calendario Operativo Integrado**
  - [x] Crear entidad `EventoCalendario` (Reuniones con Clientes, Internas, Hitos).
  - [x] Diseñar la pestaña de Calendario mensual/semanal con HSL y transparencias.
  - [x] Implementar filtros por tipo de evento y miembro del equipo asignado.

- [x] **Ciclo 5: Tareas Enlazadas, Kanban Dinámico e Informes de Rendimiento**
  - [x] Permitir agregar, renombrar y reordenar columnas del tablero Kanban dinámicamente.
  - [x] Permitir enlazar Tareas Operativas a un Espacio, Proyecto y Recurso (con acciones rápidas como copiar prompt o abrir link).
  - [x] Integrar planes de video en el calendario e informes semanales con lecciones aprendidas y métricas.

- [x] **Ciclo 6: Proyectos Web Simplificados en el Mapa Interactivo**
  - [x] Implementar plantilla ágil para desarrollo de sitios web (Landing, Institucional, Tienda).
  - [x] Crear panel de Relevamiento Inicial (metas, secciones, branding del cliente).
  - [x] Crear generador de Cotizaciones y Presupuestos exportables a PDF con logo corporativo.
  - [x] Desarrollar sitemap gráfico interactivo (Mapa de Estructura Web).
  - [x] Visualizar colaboradores específicos trabajando en el proyecto web.

- [x] **Ciclo 7: Planificador de Contenidos y Kanban de Producción B2B**
  - [x] Eliminar sub-pestaña obsoleta "Muro de Ideas" en espacio del miembro.
  - [x] Integrar rango de fechas (lunes a domingo) predeterminado para el Plan Semanal.
  - [x] Diseñar Calendario Semanal interactivo con grilla de 7 días.
  - [x] Implementar barra lateral con posts sin programar y borradores históricos "No Publicados".
  - [x] Desarrollar Drag-and-Drop completo en calendario (programar, reprogramar y desprogramar arrastrando a zona de descarte).
  - [x] Crear Tablero Kanban de Producción de 6 columnas con cálculo dinámico de avance.
  - [x] Crear modal premium de detalles (`PostDetailsModal`) con edición de metadatos y checklists interactivos de batching y SEO.

- [x] **Ciclo 8: Integración PWA (Progressive Web App)**
  - [x] Instalar y configurar `vite-plugin-pwa` en la compilación de Vite.
  - [x] Diseñar e integrar logotipos MateCode PNG optimizados (`192x192px` y `512x512px`).
  - [x] Configurar manifest en modo `standalone` para ejecución estilo app Notion.
  - [x] Implementar el registro del Service Worker en `main.tsx` con soporte TS (`vite-env.d.ts`).

