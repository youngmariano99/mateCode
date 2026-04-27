# Guía de Migración: Componentes a Spatial OS

Esta guía documenta el inventario de módulos de negocio que deben ser inyectados en el `UILayer` del Mapa Interactivo (Spatial OS) y los cambios necesarios para desacoplarlos de la navegación tradicional.

## 🎯 Objetivo
Transformar MateCode en una SPA (Single Page Application) inmersiva donde el mapa 2D es el orquestador global, eliminando la necesidad de cambiar de URL para acceder a las fases del proyecto.

## 📋 Inventario de Componentes a Migrar

| Sala en Mapa | Componente Real | Estado | Ruta Original (Referencia) |
| :--- | :--- | :--- | :--- |
| **RECEPCIÓN** | `CrmDashboard` | Pendiente | `/app/crm/leads` |
| **SALA EQUIPO** | `TeamManagement` | Pendiente | `/app/team` |
| **LA BÓVEDA** | `Vault` / `PromptLibrary` | Pendiente | `/app/vault` |
| **LAB ADN (Phase 0)** | `Phase0Feasibility` | Pendiente | `/projects/:id/phase-0-feasibility` |
| **ESTRATEGIA (Phase 1)**| `MapaHistoriasBoard` | En Proceso | `/projects/:id/phase-1-requirements` |
| **DISEÑO (Phase 2)** | `UniversalErdWorkspace` | En Proceso | `/projects/:id/phase-2-design` |
| **DEVHUB (Phase 3)** | `ActiveSprintBoard` | En Proceso | `/projects/:id/phase-3-implementation` |
| **QA LAB (Phase 4)** | `Phase4Testing` | Pendiente | `/projects/:id/phase-4-testing` |
| **DATA CENTER** | `Phase5Deployment` | Pendiente | `/projects/:id/phase-5-deploy` |

## 🛠️ Estándar de Refactorización (Reglas de Oro)

### 1. Desacoplamiento de URL
Todos los componentes deben dejar de usar `useParams()` de `react-router-dom`.
- **Antes:** `const { id } = useParams();`
- **Después:** `const activeProjectId = useWorkspaceStore(state => state.activeProjectId);`

### 2. Control de Estado Nulo
Si `activeProjectId` es `null`, el componente NO debe intentar hacer fetch. Debe renderizar un mensaje de aviso.

### 3. Limpieza de Layout (Modo Inyectado)
- Eliminar `Navbar`, `Sidebar` o `Footer` internos.
- Los contenedores deben usar `w-full h-full` y evitar márgenes fijos.
- El fondo debe ser transparente o integrarse con el `bg-zinc-950/20` del modal.
