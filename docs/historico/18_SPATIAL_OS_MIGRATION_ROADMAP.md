# 🗺️ MateCode Spatial OS: Definitive Migration Blueprint v1.1

Este documento es la guía maestra para la inyección de módulos funcionales y presencia en tiempo real dentro del **Plano Arquitectónico 2D (Spatial OS)**. Sustituye y expande las definiciones previas para asegurar una migración sin pérdida de contexto.

---

## 🏗️ Core Architecture Reference
El sistema reside en `frontend/src/components/layout/WorkspaceMap.tsx`.
- **Motor:** SVG + Framer Motion (Plano Integrado con paredes compartidas).
- **Navegación:** Zoom (rueda), Pan (drag) y Selección (`activeRoom`).
- **Portal de UI:** El componente `UILayer` inyecta los módulos mediante un portal modal.

---

## 📋 Matriz de Migración de Módulos

### 🏢 ALA ADMINISTRATIVA (Global del Workspace)
| Oficina | Funcionalidad | Componente | Ruta |
| :--- | :--- | :--- | :--- |
| **Recepción & CRM** | Gestión de Leads | `LeadInbox` | `src/components/crm/LeadInbox.tsx` |
| **Biblioteca IA** | Motor de Prompts | `GeneradorPromptDesignModal` | `src/components/design/GeneradorPromptDesignModal.tsx` |
| **Sala de Equipo** | Usuarios y Roles (RBAC) | `RolesMatrixView` | `src/components/design/RolesMatrixView.tsx` |
| **La Bóveda** | Credenciales y Secretos | `VaultExtractorWizard` | `src/components/vault/VaultExtractorWizard.tsx` |

### 🚀 ALA DE PRODUCCIÓN (Reactiva a `activeProject`)
| Fase | Oficina | Componente Principal | Ruta |
| :--- | :--- | :--- | :--- |
| **Fase 0** | **Lab ADN** | `BddEditorPanel` | `src/components/agile/BddEditorPanel.tsx` |
| **Fase 1** | **Estrategia** | `MapaHistoriasBoard` | `src/components/agile/MapaHistoriasBoard.tsx` |
| **Fase 2** | **Arquitectura** | `UniversalErdWorkspace` | `src/components/design/UniversalErdWorkspace.tsx` |
| **Fase 3** | **DevHub Mando** | `DevHubLayout` | `src/components/devhub/DevHubLayout.tsx` |
| **Fase 4** | **QA Lab** | `BugTracker` | `src/components/devhub/BugTracker.tsx` |
| **Fase 5** | **Lanzamiento** | `VaultExtractorWizard` | `src/components/vault/VaultExtractorWizard.tsx` |

---

## 📡 Fase Multiplayer: Presencia en Tiempo Real

Para implementar la presencia física de los usuarios en el mapa:
1. **Conexión Hub:** Suscribirse al `DevHubHub` (SignalR) en el componente `WorkspaceMap`.
2. **Hook de Presencia:** Escuchar el evento `UserPresenceChanged`.
3. **Mapeo de Coordenadas:** 
   - Cada componente migrado debe emitir su ID de sala al montarse.
   - El mapa debe renderizar un `UserAvatar` en las coordenadas `(x, y)` de la sala donde el usuario esté "trabajando" actualmente.

---

## 🚨 Sala de Guerra (Emergency Meeting)

Cuando se requiera una reunión síncrona en el DevHub:
- **Inyección:** Integrar `SynchronousMeetingRoom.tsx` dentro del modal del DevHub.
- **Trigger:** Activar la "Luz de Alerta" (animación roja pulsante) en el plano cuando haya una sesión activa detectada por SignalR.

---

## 🛠️ Instrucciones de Desarrollo para la IA

### 1. Inyección de Componentes
Modificar el `switch` de `renderModule()` en `UILayer`:
```tsx
const renderModule = () => {
  if (activeRoom === 'phase03') {
     // Inyectar DevHubLayout que ya contiene Kanban, Bugs y ADRs
     return <DevHubLayout />;
  }
  // ... resto de casos mapeados arriba ...
}
```

### 2. Contexto de Proyecto
Asegurar que todos los componentes del **Ala de Producción** reciban el `activeProjectId` del store. Si el componente no está cargando datos, verificar la sincronización con el selector del TopBar.

### 3. Visual Standard
- Fondo de componentes: `transparent` o `#0A0F1A`.
- Bordes: Evitar `border-slate-800` redundantes; usar el marco del modal del mapa.
- Scroll: Usar `custom-scrollbar` definido en `index.css`.

---

> [!IMPORTANT]
> Esta migración transforma el sistema de una SPA tradicional a un **Operating System Espacial**. Mantener la fidelidad arquitectónica del plano SVG en todo momento.
