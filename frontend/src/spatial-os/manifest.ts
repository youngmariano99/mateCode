/**
 * ============================================================================
 *  SPATIAL OS — FLOOR PLAN MANIFEST
 * ============================================================================
 *
 *  This file is the SINGLE SOURCE OF TRUTH for the entire 3D office layout.
 *
 *  Any other AI / engineer can read this manifest and:
 *    1. Reproduce the exact same floor plan in another R3F project.
 *    2. Add / remove / move rooms without touching the rendering code.
 *    3. Generate documentation, mini-maps, navigation graphs, etc.
 *
 *  COORDINATE SYSTEM (right-handed, R3F default):
 *    - X axis  → horizontal (east/west on the floor plan)
 *    - Z axis  → depth     (north/south on the floor plan)
 *    - Y axis  → vertical  (height — walls grow upward)
 *
 *  All rooms are defined as axis-aligned rectangles on the X/Z plane.
 *  Their `position` is the CENTER of the room at floor level (y = 0).
 *  Their `size` is [width(X), height(Y), depth(Z)].
 *
 *  HOW TO EXPORT TO ANOTHER PROJECT:
 *    - Copy `src/spatial-os/` as a whole. It is self-contained.
 *    - Only external deps required: three, @react-three/fiber, @react-three/drei.
 * ============================================================================
 */

export type Vec3 = [number, number, number];

export type Wing = "admin" | "production";

export interface DoorGap {
  /** Which wall the door is on, relative to the room's local frame. */
  side: "north" | "south" | "east" | "west";
  /** Offset along that wall from the room center, in world units. */
  offset: number;
  /** Width of the gap in world units. */
  width: number;
}

export interface RoomManifest {
  id: string;
  /** Display name shown floating above the room via <Html />. */
  name: string;
  /** Short subtitle / phase tag. */
  subtitle: string;
  wing: Wing;
  /** Center of the room footprint at floor level. */
  position: Vec3;
  /** [width(X), wallHeight(Y), depth(Z)]. */
  size: Vec3;
  /** LED accent color (hex). Drives baseboards, screens, and signage glow. */
  accent: string;
  /** Floor finish. Used by the floor renderer. */
  floor: "wood" | "porcelain" | "carpet" | "metal" | "grid" | "glossy";
  /** Optional secondary tint for the floor (carpets, accent rugs). */
  floorTint?: string;
  /** Door openings cut out of the surrounding walls. */
  doors: DoorGap[];
}

/**
 * Building footprint. The outer shell wraps every room.
 * Adjust `bounds` if you add rooms outside the current envelope.
 */
export const BUILDING = {
  bounds: {
    minX: -22,
    maxX: 22,
    minZ: -16,
    maxZ: 16,
  },
  wallHeight: 3,
  wallThickness: 0.25,
  /** Central corridor running east/west through the building. */
  corridor: {
    z: 0,
    width: 3.5, // total width of the corridor band
  },
} as const;

/**
 * ROOMS
 * ---------------------------------------------------------------------------
 *  Layout (top-down, +X right, +Z toward viewer):
 *
 *                 ADMIN WING (north, -Z)            PRODUCTION WING (south, +Z)
 *   ┌────────────┬────────────┬────────────┐   ┌────────────┬────────────┐
 *   │ Reception  │  Library   │ Team Room  │   │  DNA Lab   │ Strategy   │
 *   │            │            │            │   │            │            │
 *   ├────────────┴────────────┴─── Vault ──┤   ├ Architect.─┴── DevHub ──┤
 *   │              CENTRAL CORRIDOR (z≈0)            │  Servers │
 *   └────────────────────────────────────────────────┴──────────┘
 *
 *  Only 4+ rooms are fully furnished in this prototype (per spec):
 *    Reception, Library, DevHub, Servers.
 *  The remaining rooms render as walled shells with accent + label,
 *  ready for furniture modules to be plugged in later.
 */
export const ROOMS: RoomManifest[] = [
  // -------------------- ADMIN WING (north, negative Z) --------------------
  {
    id: "reception",
    name: "Recepción & CRM",
    subtitle: "Gestión de Clientes",
    wing: "admin",
    position: [-15, 0, -8],
    size: [12, 3, 10],
    accent: "#e8eef5",
    floor: "porcelain",
    doors: [{ side: "south", offset: 3, width: 1.6 }],
  },
  {
    id: "library",
    name: "Biblioteca",
    subtitle: "Prompts & Plantillas",
    wing: "admin",
    position: [-3, 0, -9],
    size: [10, 3, 8],
    accent: "#a855f7",
    floor: "wood",
    doors: [{ side: "south", offset: 0, width: 1.6 }],
  },
  {
    id: "team",
    name: "Sala de Equipo",
    subtitle: "Roles & Permisos",
    wing: "admin",
    position: [8, 0, -9],
    size: [8, 3, 8],
    accent: "#ec4899",
    floor: "carpet",
    floorTint: "#3a1f2e",
    doors: [{ side: "south", offset: 0, width: 1.6 }],
  },
  {
    id: "vault",
    name: "La Bóveda",
    subtitle: "Credenciales & Seguridad",
    wing: "admin",
    position: [16, 0, -8],
    size: [8, 3, 10],
    accent: "#10b981",
    floor: "metal",
    doors: [{ side: "south", offset: -2, width: 1.4 }],
  },

  // ------------------ PRODUCTION WING (south, positive Z) ------------------
  {
    id: "dna-lab",
    name: "Laboratorio de ADN",
    subtitle: "Fase 0 · Stack & Restricciones",
    wing: "production",
    position: [-15, 0, 8],
    size: [12, 3, 10],
    accent: "#84cc16",
    floor: "glossy",
    doors: [{ side: "north", offset: 3, width: 1.6 }],
  },
  {
    id: "strategy",
    name: "Sala de Estrategia",
    subtitle: "Fase 1 · User Story Mapping",
    wing: "production",
    position: [-3, 0, 9],
    size: [10, 3, 8],
    accent: "#facc15",
    floor: "carpet",
    floorTint: "#3a2f15",
    doors: [{ side: "north", offset: 0, width: 1.6 }],
  },
  {
    id: "architecture",
    name: "Estudio de Arquitectura",
    subtitle: "Fase 2 · ERD & UML",
    wing: "production",
    position: [6, 0, 9],
    size: [8, 3, 8],
    accent: "#06b6d4",
    floor: "wood",
    doors: [{ side: "north", offset: 0, width: 1.6 }],
  },
  {
    id: "devhub",
    name: "Centro de Mando DevHub",
    subtitle: "Fase 3 · Desarrollo",
    wing: "production",
    position: [15, 0, 9],
    size: [12, 3, 8],
    accent: "#ef4444",
    floor: "porcelain",
    doors: [{ side: "north", offset: -3, width: 1.6 }],
  },
  {
    id: "servers",
    name: "Cuarto de Servidores",
    subtitle: "Infraestructura",
    wing: "production",
    position: [16, 0, 0.5],
    size: [8, 3, 5],
    accent: "#3b82f6",
    floor: "grid",
    doors: [{ side: "west", offset: 0, width: 1.4 }],
  },
];

/** Quick lookup helper. */
export const getRoom = (id: string) => ROOMS.find((r) => r.id === id);
