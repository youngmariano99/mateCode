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
