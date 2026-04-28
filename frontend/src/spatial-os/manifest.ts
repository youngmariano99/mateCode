/**
 * ============================================================================
 *  SPATIAL OS — FLOOR PLAN MANIFEST
 * ============================================================================
 *
 *  This file is the SINGLE SOURCE OF TRUTH for the entire 3D office layout.
 *
 *  Architecture:
 *    - Bounds define the building envelope.
 *    - Tiled wings (Admin vs Production) connected by a central corridor.
 *    - Contiguous tiling ensures no gaps between side-by-side rooms.
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
  name: string;
  subtitle: string;
  wing: Wing;
  position: Vec3;
  size: Vec3;
  accent: string;
  floor: "wood" | "porcelain" | "carpet" | "metal" | "grid" | "glossy";
  floorTint?: string;
  doors: DoorGap[];
}

export const BUILDING = {
  bounds: {
    // West edge extended from -22 → -30 to host the Lobby / Spawn Point.
    minX: -30,
    maxX: 22,
    minZ: -16,
    maxZ: 16,
  },
  wallHeight: 3,
  wallThickness: 0.25,
  corridor: {
    z: 0,
    width: 3.5,
    /**
     * Corridor X extents. Decoupled from bounds so a full-depth room (e.g. the
     * Lobby) can occupy the west end of the building without the corridor
     * floor/walls poking into it. The corridor now starts at x = -22 (east
     * edge of the Lobby) and runs to the east perimeter.
     */
    minX: -22,
    maxX: 22,
  },
} as const;

const WING_DEPTH =
  (BUILDING.bounds.maxZ - BUILDING.bounds.minZ) / 2 - BUILDING.corridor.width / 2;
const ADMIN_Z = -(BUILDING.corridor.width / 2 + WING_DEPTH / 2);
const PROD_Z = BUILDING.corridor.width / 2 + WING_DEPTH / 2;

export const ROOMS: RoomManifest[] = [
  // ---------------- LOBBY / SPAWN POINT (west end, full depth) ----------------
  {
    id: "lobby",
    name: "Lobby · Spawn Point",
    subtitle: "Punto de entrada",
    wing: "admin",
    position: [-26, 0, 0],
    size: [8, 3, BUILDING.bounds.maxZ - BUILDING.bounds.minZ],
    accent: "#f1f5f9", // bright silver/white
    floor: "porcelain",
    // Door on the east wall (into the corridor). Offset is along Z (room-local).
    doors: [{ side: "east", offset: 0, width: 2.2 }],
  },

  // ---------------- ADMIN WING (north, negative Z) ----------------
  {
    id: "reception",
    name: "Recepción & CRM",
    subtitle: "Gestión de Clientes",
    wing: "admin",
    position: [-16, 0, ADMIN_Z],
    size: [12, 3, WING_DEPTH],
    accent: "#e8eef5",
    floor: "porcelain",
    doors: [{ side: "south", offset: 3, width: 1.6 }],
  },
  {
    id: "library",
    name: "Biblioteca",
    subtitle: "Prompts & Plantillas",
    wing: "admin",
    position: [-4.5, 0, ADMIN_Z],
    size: [11, 3, WING_DEPTH],
    accent: "#a855f7",
    floor: "wood",
    doors: [{ side: "south", offset: 0, width: 1.6 }],
  },
  {
    id: "team",
    name: "Sala de Equipo",
    subtitle: "Roles & Permisos",
    wing: "admin",
    position: [6.5, 0, ADMIN_Z],
    size: [11, 3, WING_DEPTH],
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
    position: [17, 0, ADMIN_Z],
    size: [10, 3, WING_DEPTH],
    accent: "#10b981",
    floor: "metal",
    doors: [{ side: "south", offset: -2, width: 1.4 }],
  },

  // ---------------- PRODUCTION WING (south, positive Z) ----------------
  {
    id: "dna-lab",
    name: "Laboratorio de ADN",
    subtitle: "Fase 0 · Stack & Restricciones",
    wing: "production",
    position: [-16, 0, PROD_Z],
    size: [12, 3, WING_DEPTH],
    accent: "#84cc16",
    floor: "glossy",
    doors: [{ side: "north", offset: 3, width: 1.6 }],
  },
  {
    id: "strategy",
    name: "Sala de Estrategia",
    subtitle: "Fase 1 · User Story Mapping",
    wing: "production",
    position: [-5, 0, PROD_Z],
    size: [10, 3, WING_DEPTH],
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
    position: [4.5, 0, PROD_Z],
    size: [9, 3, WING_DEPTH],
    accent: "#06b6d4",
    floor: "wood",
    doors: [{ side: "north", offset: 0, width: 1.6 }],
  },
  {
    id: "devhub",
    name: "Centro de Mando DevHub",
    subtitle: "Fase 3 · Desarrollo",
    wing: "production",
    position: [13.5, 0, PROD_Z],
    size: [9, 3, WING_DEPTH],
    accent: "#ef4444",
    floor: "porcelain",
    doors: [{ side: "north", offset: -3, width: 1.6 }],
  },
  {
    id: "servers",
    name: "Cuarto de Servidores",
    subtitle: "Infraestructura",
    wing: "production",
    position: [20, 0, PROD_Z],
    size: [4, 3, WING_DEPTH],
    accent: "#3b82f6",
    floor: "grid",
    doors: [{ side: "north", offset: 0, width: 1.4 }],
  },
];

export const getRoom = (id: string) => ROOMS.find((r) => r.id === id);
