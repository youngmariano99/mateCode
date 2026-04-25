# Especificación Técnica: Módulo "Virtual HQ" (Metaverso Colaborativo DevHub)

## 1. Visión General
El DevHub abandona la navegación por pestañas tradicional para convertirse en un "Virtual HQ" (Oficina Virtual 2D) de una sola página (SPA). El lienzo principal funciona como un mapa interactivo donde los usuarios (representados por avatares) se mueven entre "Zonas" de forma automática según la tarea que estén realizando. Se incorpora el concepto de "Sesiones Síncronas" (estilo *Among Us*) para resolución de Bugs y toma de Decisiones (ADRs), y Pizarras efímeras ("Salas de Reunión").

## 2. Actualización del Modelo de Datos (PostgreSQL)
Para soportar la vinculación flexible de elementos desde el nuevo lienzo unificado, se debe ejecutar la siguiente migración:
- Añadir columna polimórfica a Decisiones: `ALTER TABLE colab.decisiones ADD COLUMN elementos_relacionados JSONB DEFAULT '[]';`
- *(El formato esperado del JSONB es `[{"tipo": "ticket", "id": "uuid", "titulo": "..."}]`)*

## 3. Arquitectura de Zonas (Frontend Layout)
El componente raíz `VirtualOfficeMap.tsx` ocupa el 100vw/100vh. Se divide lógicamente mediante CSS Grid o Flexbox en Zonas:
1. **Cafetería / Pasillo (Idle):** Estado por defecto al entrar.
2. **Sala de Servidores (Backend) & Estudio (Frontend):** Zonas de "Focus". Si un usuario asocia su estado a un ticket, su avatar transiciona visualmente (animación) a esta zona.
3. **Salas de Reuniones (Sync Rooms):** Zonas dinámicas que se instancian cuando se crea una Pizarra o una Sesión de Votación.

## 4. Motor de Presencia y Diálogos (SignalR)
El Hub de C# (`DevHubHub`) y los clientes React deben manejar el estado compuesto de cada usuario.

**Estructura del State de Presencia (`UserPresence`):**
```typescript
interface UserPresence {
  userId: string;
  nombre: string;
  zonaActual: 'pasillo' | 'focus_backend' | 'focus_frontend' | 'reunion';
  actividadActual?: { tipo: 'ticket' | 'bug' | 'decision', id: string, titulo: string };
  globoDialogo?: { texto: string, tipo: 'info' | 'accion' | 'alerta', expiraEn: number }; // Renderiza un bocadillo flotante encima del avatar
}

Comportamiento UI: Si Juan hace clic en "Proponer Decisión", SignalR hace broadcast de un globoDialogo: {texto: "💡 Proponiendo decisión...", tipo: "accion"}. El resto de los usuarios ve aparecer ese diálogo sobre el avatar de Juan en tiempo real.

5. Lógica de Sesiones Síncronas (Multiplayer Eventos)
5.1. Pizarras Efímeras (Salas Abiertas)
Creación: Usuario hace clic en "Nueva Pizarra". El sistema emite vía SignalR BoardCreated(id, nombre).

Interacción: Sobre el avatar del creador aparece un cartel: "Pizarra: Arquitectura BD [🚪 Entrar]". Los demás pueden hacer clic ahí para unirse.

La Vista: Al hacer clic, el avatar del invitado viaja a la "Sala de Reunión" y el lienzo tldraw se renderiza en overlay, sincronizando cursores de todos los presentes.

5.2. Reunión de Emergencia (Votación Síncrona)
Inspirado en mecánicas de juegos multijugador para resolver bloqueos rápidamente.

Disparador: Desde un Bug o Decisión, un usuario presiona "Convocar Reunión".

Broadcast: SignalR emite EmergencyMeetingCalled(entidadId, tipo, creadorId).

Reacción UX: La pantalla de todos los conectados muestra un Modal superpuesto (Banner): "⚠️ Juan solicita reunión por [Bug #42]. [Aceptar] / [Ignorar]".

La Sala de Sesión (SynchronousMeetingRoom.tsx):

Los que aceptan van a esta vista (Modal full-screen o overlay opaco).

Izquierda: Visor estático del Bug/Decisión con sus campos y vínculos.

Derecha (Lateral): Chat efímero en vivo (solo dura la sesión).

Bottom Bar: Botones de Voto (Aceptar/Rechazar, Prioridad Alta/Baja).

Cierre: Cuando el creador presiona "Finalizar Sesión", el backend recolecta votos, guarda el estado final en BD, dispara evento MeetingEnded y los avatares vuelven a la zona "Idle".

6. Buscador Universal y Vinculación (El "Oráculo")
En cualquier panel flotante (Drawer lateral) de un Bug o Decisión, debe existir un <RelationPicker />.

Este input utiliza el endpoint de búsqueda GET /api/Oracle/search?q= (con debounce) para buscar en el Backlog de Tickets (agil.tickets), en Bugs históricos y Decisiones.

Al seleccionar, inserta el registro en el JSONB elementos_relacionados o en ticket_asociado_id.


---
