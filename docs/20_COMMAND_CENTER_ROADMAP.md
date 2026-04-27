# Roadmap: Centro de Mando Síncrono (Spatial OS)

Este documento detalla los pasos necesarios para convertir la interfaz del Centro de Mando en un sistema 100% funcional y conectado.

## 🟢 FASE 1: Telemetría y Actividad Real (Panel Derecho) - COMPLETADA ✅
*Objetivo: Que el usuario sienta que la oficina está viva viendo datos reales.*

- [x] **Métricas en Vivo:**
    - [x] Conectar "Usuarios Conectados" con el conteo real de `presences`.
    - [x] Calcular "Oficinas Activas" filtrando las zonas únicas en el estado de presencia.
    - [x] Simular "Carga del Servidor" (Visualmente listo).
- [x] **Feed de Eventos Progresivo:**
    - [x] Emitir evento `LogMovement` (ActivityLogged) desde el Backend cuando un usuario se mueve.
    - [x] Mostrar en el feed: "X entró a la sala Y" con timestamps reales y persistencia en BD.
    - [ ] Integrar eventos de creación de tickets o cambios de estado de bugs (Pendiente).

## 🔵 FASE 2: Dossier e Inteligencia (Panel Izquierdo) - EN PROGRESO 🛠️
*Objetivo: Acceso rápido a la documentación y comunicación sin entrar a salas.*

- [x] **Chat Global del Espacio:**
    - [x] Implementar método `SendGlobalMessage` en `DevHubHub.cs`.
    - [x] Conectar el input del panel izquierdo con persistencia en BD (`mensajes_globales`).
    - [x] Historial persistente: Cargar mensajes anteriores al entrar al espacio.
- [x] **Historial de Reuniones (Dossier):**
    - [x] Carga automática de `GET /api/colab/meetings` al entrar al espacio.
    - [x] Visualizador de Actas (SweetAlert2) con renderizado de decisiones y resultados.
    - [x] Persistencia de Actas en formato JSONB con auditoría de participantes.
- [x] **Inteligencia de Decisión (War Room):**
    - [x] Sistema de Encuestas Dinámicas (SÍ/NO, Única, Múltiple).
    - [x] Transmisión de resultados en tiempo real y popup de ganador sincronizado.
    - [x] Historial de decisiones tomadas durante la sesión síncrona.
- [x] **Unificación de Ecosistema:**
    - [x] Refactorización de `DevHubLayout` para compartir el `PresenceContext` (Conexión única).

## 🟡 FASE 3: Experiencia de Navegación (Centro)
*Objetivo: Control total sobre el lienzo 2D.*

- [ ] **Controles de Zoom:**
    - [ ] Crear un store de Zustand o Context para `mapScale`.
    - [ ] Conectar los botones `+` y `-` del Layout con el `transform: scale()` del `WorkspaceMap`.
- [ ] **Navegación Asistida:**
    - [ ] Botón "Centrar en mi Avatar" para no perderse en mapas grandes.
    - [ ] Tooltips informativos al pasar el mouse sobre las salas.

## 🔴 FASE 4: Integración de Módulos (Finalización)
*Objetivo: Que al entrar a una oficina, se abra el módulo correspondiente.*

- [ ] **Inyección de Componentes:**
    - [ ] Al hacer clic en "Arquitectura", abrir el `UniversalErdWorkspace` en un overlay premium.
    - [ ] Al hacer clic en "Estrategia", abrir el `UserStoryMap`.
    - [ ] Asegurar que el estado de presencia se actualice al abrir estos módulos.

---
**Regla de Oro:** No pasamos a la siguiente fase hasta que la actual esté testeada y sea visualmente impecable.
