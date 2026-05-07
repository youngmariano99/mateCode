# Plan de Migración: Spatial OS Blueprint & Dynamic Workspace

Este documento detalla el plan estratégico para migrar la interfaz actual de MateCode al nuevo sistema de **Spatial OS** (Blueprint Arquitectónico) y el entorno de **Dynamic Workspace**.

## 🎯 Objetivo
Elevar la experiencia de usuario (UX) a un estándar de herramienta profesional tipo IDE, mejorando el rendimiento mediante la técnica de **Scene Hiding** y permitiendo una navegación fluida entre módulos sin perder el contexto espacial.

---

## 🛠️ Fase 1: El Nuevo Mapa "Blueprint" (2D)
Reemplazaremos el mapa 2D actual por el nuevo diseño técnico interactivo.

### Acciones Previas:
- **Instalar Dependencias**: `npm install react-zoom-pan-pinch`.

### Cambios en Archivos:
- **Crear**: `frontend/src/components/spatial/Map2D.tsx`.
- **Crear**: `frontend/src/components/spatial/Avatar2D.tsx`.
- **Crear**: `frontend/src/components/spatial/furniture.tsx`.
- **Modificar**: `frontend/src/components/layout/WorkspaceMap.tsx`.

### Precauciones Técnicas:
1. **Mapeo de IDs (Crítico)**: El blueprint usa `dna-lab`, el backend usa `phase00`. Implementaremos un objeto `ROOM_MAPPER` para traducir clics y presencias sin tocar la DB.
2. **Transformación de Coordenadas**: Los avatares en 3D usan unidades mundo (ej. -16, 0, 10). Crearemos un helper `worldToSvg(pos)` para que se vean en el lugar correcto del mapa 2D.
3. **Zoom & Pan**: Envolveremos el `Map2D` en el `TransformWrapper` para habilitar la navegación estilo Figma/Miro.

---

## 🏗️ Fase 2: Entorno Base de Trabajo (DynamicWorkspace)
Implementación del nuevo contenedor inteligente para herramientas.

### Cambios en Archivos:
- **Crear**: `frontend/src/components/spatial/DynamicWorkspace.tsx`.
- **Crear**: `frontend/src/components/spatial/FloatingScratchpad.tsx`.
- **Modificar**: `frontend/src/index.css` (para asegurar que las clases de Tailwind del blueprint no colisionen).

### Precauciones Técnicas:
1. **Z-Index Management**: El `DynamicWorkspace` debe estar en `z-50`, por debajo de los modales de alerta pero por encima de todo el Spatial OS.
2. **Persistence**: El `FloatingScratchpad` usa `localStorage`. Aseguraremos que la clave tenga el prefijo `matecode_` para evitar colisiones.

---

## 🎭 Fase 3: Orquestación y Scene Hiding
Configuración del orquestador principal para optimizar recursos.

### Cambios en Archivos:
- **Modificar**: `frontend/src/spatial-os/SpatialOS.tsx`.
- **Modificar**: `frontend/src/store/useWorkspaceStore.ts` (añadir estado `viewMode`).

### Estrategia de Scene Hiding:
1. **Estado Reactivo**: `SpatialOS.tsx` escuchará el `onViewModeChange`.
2. **Optimización GPU**: 
   - Si `viewMode === 'maximized'`, aplicaremos la clase `hidden` al contenedor del Canvas 3D.
   - Esto libera ciclos de GPU al 100% mientras el usuario está en el workspace.

---

## 🎁 Fase 4: Envoltura de Herramientas (Refactor de Modales)
Migración de los componentes internos al nuevo contenedor.

### Cambios en Archivos:
- **Modificar**: `frontend/src/spatial-os/components/SpatialOverlay.tsx`.

### Precauciones Técnicas:
1. **Props 1:1**: No tocaremos la lógica interna de los componentes (Hooks/API).
2. **Quick Switcher**: El sidebar usará los iconos de `Lucide` ya presentes en el proyecto para mantener la coherencia visual.

---

## ✅ Checklist de Validación
- [ ] ¿El mapa 2D carga correctamente los avatares en tiempo real?
- [ ] ¿Al maximizar el workspace, el consumo de GPU de la pestaña disminuye?
- [ ] ¿Funciona la tecla `Escape` para cerrar el workspace?
- [ ] ¿Se mantienen los datos del formulario al alternar entre modo ventana y pantalla completa?

---
**Nota para el Lead**: No se iniciará la Fase 1 hasta que este documento sea aprobado y los archivos base estén verificados.
