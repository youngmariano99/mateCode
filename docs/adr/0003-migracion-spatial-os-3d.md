# ADR-0003: Migración a Entorno de Trabajo Espacial (Spatial OS 2D/3D)

## Status

Aceptado

## Contexto

Las herramientas tradicionales de gestión de tareas y equipos (ej. Jira, Trello) presentan una alta carga cognitiva al forzar la navegación lineal a través de URLs de páginas completas, listas infinitas y recargas constantes. Esto rompe el flujo de concentración de los desarrolladores. 

Se requería un enfoque de revelación progresiva y fricción cero que permitiera integrar en un único plano interactivo el CRM, la Bóveda de Stacks, los tableros Kanban de los equipos y las salas de colaboración presencial.

## Decisión

Migrar el frontend hacia una interfaz espacial de **"Vista Dual" (Spatial OS)** que representa las oficinas y salas del equipo mediante un mapa interactivo:

1.  **Capa Interactiva 2D:** Implementar un mapa interactivo de coordenadas espaciales y regiones poligonales (`WorkspaceMap.tsx`). Al hacer clic en salas como Recepción, Biblioteca o Sala de Guerra se inyectan las herramientas modulares del CRM, Bóveda o Kanban en capas Glassmorphism superpuestas.
2.  **Capa Inmersiva 3D:** Renderizar un entorno tridimensional interactivo de alta fidelidad 1:1 mediante **React Three Fiber (R3F)** y **Three.js** con avatares sincronizados en tiempo real por SignalR y física de colisión simulada.
3.  **Carga Dinámica (Lazy Loading):** Implementar **Suspense** y carga perezosa para el entorno 3D. El motor 3D de R3F se cargará únicamente bajo demanda del usuario para no penalizar la velocidad de la aplicación base.

## Consecuencias

*   (+) Eliminación total de la navegación estructurada por URLs tradicionales; toda la suite de desarrollo convive en un único espacio unificado.
*   (+) Incremento en la gamificación e interacción del equipo mediante presencia e indicadores visuales de alta fidelidad.
*   (+) Minimización de la carga cognitiva con transiciones inmersivas basadas en la ubicación del cursor y cámaras virtuales.
*   (-) Mayor demanda de recursos de GPU y CPU en el cliente al activar la vista 3D.
*   (-) Aumento en la complejidad del código frontend por el manejo de coordenadas 3D, luces y texturas PBR.
