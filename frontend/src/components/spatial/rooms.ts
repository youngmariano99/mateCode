/**
 * ============================================================================
 *  ROOMS Manifest — Single Source of Truth for the Spatial OS floor plan.
 * ============================================================================
 */

export type Wing = "admin" | "production";
export type Side = "top" | "right" | "bottom" | "left";

export interface Door {
  side: Side;
  offset: number;
  length: number;
}

export interface Room {
  id: string;
  number: number;
  name: string;
  subtitle?: string;
  wing: Wing;
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  fortified?: boolean;
  doors: Door[];
}

export const MAP_WIDTH = 1600;
export const MAP_HEIGHT = 1000;

export const CORRIDOR_Y = 470;
export const CORRIDOR_HEIGHT = 60;

export const ROOMS: Room[] = [
  {
    id: "reception",
    number: 1,
    name: "00 · Recepción & CRM",
    subtitle: "Gestión de Clientes",
    wing: "admin",
    x: 80, y: 80, width: 360, height: 340,
    accent: "#E2E8F0",
    doors: [{ side: "bottom", offset: 160, length: 50 }],
  },
  {
    id: "library",
    number: 2,
    name: "Bóveda de Conocimiento",
    subtitle: "ERD & Documentación",
    wing: "admin",
    x: 440, y: 80, width: 340, height: 340,
    accent: "#A78BFA",
    doors: [{ side: "bottom", offset: 150, length: 50 }],
  },
  {
    id: "team",
    number: 3,
    name: "Centro de Colaboración",
    subtitle: "Sincronización de Equipo",
    wing: "admin",
    x: 780, y: 80, width: 380, height: 340,
    accent: "#EC4899",
    doors: [{ side: "bottom", offset: 170, length: 50 }],
  },
  {
    id: "vault",
    number: 4,
    name: "Caja Fuerte (The Vault)",
    subtitle: "Activos del Sistema",
    wing: "admin",
    x: 1160, y: 80, width: 360, height: 340,
    accent: "#059669",
    fortified: true,
    doors: [{ side: "bottom", offset: 160, length: 40 }],
  },
  {
    id: "dna-lab",
    number: 5,
    name: "01 · Análisis (Phase 00)",
    subtitle: "Factibilidad & ADN",
    wing: "production",
    x: 80, y: 580, width: 300, height: 340,
    accent: "#22D3EE",
    doors: [{ side: "top", offset: 130, length: 50 }],
  },
  {
    id: "strategy",
    number: 6,
    name: "02 · Estrategia (Phase 01)",
    subtitle: "Roadmap & Backlog",
    wing: "production",
    x: 380, y: 580, width: 320, height: 340,
    accent: "#FBBF24",
    doors: [{ side: "top", offset: 140, length: 50 }],
  },
  {
    id: "architecture",
    number: 7,
    name: "03 · Arquitectura (Phase 02)",
    subtitle: "Estructura & Diagramas",
    wing: "production",
    x: 700, y: 580, width: 300, height: 340,
    accent: "#2DD4BF",
    doors: [{ side: "top", offset: 130, length: 50 }],
  },
  {
    id: "devhub",
    number: 8,
    name: "04 · Desarrollo (Phase 03)",
    subtitle: "Implementación & Sprints",
    wing: "production",
    x: 1000, y: 580, width: 360, height: 340,
    accent: "#FB923C",
    doors: [{ side: "top", offset: 160, length: 60 }],
  },
  {
    id: "phase04",
    number: 9,
    name: "05 · Testing (Phase 04)",
    subtitle: "Control de Calidad (QA)",
    wing: "production",
    x: 1360, y: 580, width: 160, height: 340,
    accent: "#F43F5E",
    doors: [{ side: "top", offset: 60, length: 40 }],
  },
];

export const getRoom = (id: string): Room | undefined =>
  ROOMS.find((r) => r.id === id);
