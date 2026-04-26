# Especificación Técnica: Migración a "Spatial OS" (Workspace 2D)

## 1. Regla de Oro (Preservación Absoluta)
Esta migración es 100% VISUAL Y DE ENRUTAMIENTO. 
Queda ESTRICTAMENTE PROHIBIDO modificar la lógica interna, los contratos JSON, los Triggers de BD o los servicios C# de los módulos ya construidos (Fase 1, 2, 3 y DevHub). Los componentes de React existentes (Ej: `ActiveSprintBoard`, `UniversalErdWorkspace`) se tratarán como "Cajas Negras" que simplemente se montarán dentro de las nuevas "Salas" del mapa 2D.

## 2. El Nuevo Paradigma de Navegación
- **Ruta Única:** La aplicación operará principalmente bajo una ruta: `/workspace/:workspaceId`.
- **Selector de Contexto:** Un Dropdown global en la barra superior (TopBar) define el `proyecto_id` activo. Cambiar de proyecto NO recarga la página, solo cambia el contexto que le pasamos a las salas.
- **Renderizado de Salas:** En lugar de `react-router-dom` para las vistas internas, usamos el estado local del mapa (`activeRoom`). Al entrar a una sala, se abre un overlay o panel a pantalla completa que monta el componente correspondiente.

## 3. Hoja de Ruta de Migración (Por Fases)

### Fase 1: El Lienzo y el Contexto Global (Fundación)
- Implementar `WorkspaceMap.tsx` (El fondo interactivo SVG/Grid).
- Crear la `TopBar` con el Selector de Proyectos y el menú de perfil.
- Definir el state global (Zustand o Context API) para `activeProject` y `activeRoom`.
- Dibujar visualmente las áreas del mapa (sin funcionalidad aún): Ala Administrativa (Izquierda) y Ala de Producción (Derecha).

### Fase 2: Ala Administrativa (Zonas de Workspace)
Estas salas NO dependen del selector de proyectos.
- **Recepción (CRM):** Montar vista de Leads.
- **La Bóveda:** Montar vista de credenciales/archivos.
- **Biblioteca:** Montar la vista del motor de Prompts y plantillas.
- **Sala de Descanso:** Montar la gestión de Usuarios y Roles (RBAC).

### Fase 3: Ala de Producción (Inyección de Módulos Existentes)
Estas salas reaccionan al `activeProject` del TopBar. Acá inyectamos lo que ya programamos.
- **Laboratorio ADN (Fase 0):** Montar el formulario de Stack y Blueprint.
- **Sala de Estrategia (Fase 1):** Montar `UserStoryMapBoard.tsx` (El tablero de Jeff Patton).
- **Estudio de Arquitectura (Fase 2):** Montar `UniversalErdWorkspace.tsx` y el diagrama de casos de uso.
- **Centro de Mando (Fase 3 / DevHub):** Montar el `ActiveSprintBoard.tsx` (Kanban), el Bug Tracker y el Tablero ADR.

### Fase 4: Presencia Multiplayer (El Toque Final)
- Conectar el `DevHubHub` (SignalR) ya existente al `WorkspaceMap`.
- Leer el estado de `UserPresence` y renderizar los avatares moviéndose físicamente entre las salas según el componente que tengan abierto.
- Integrar la "Sala de Guerra" (Modal síncrono para reuniones).