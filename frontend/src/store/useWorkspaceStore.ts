import { create } from 'zustand';

export interface Project {
  id: string;
  nombre: string;
  descripcion?: string;
  cliente_id?: string;
  externalSyncUrl?: string;
  externalSyncKey?: string;
  externalSyncType?: string;
}

interface WorkspaceState {
  workspaceId: string | null;
  activeProjectId: string | null;
  activeRoom: string;
  projects: Project[]; // Lista global de proyectos
  setWorkspaceId: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveRoom: (room: string) => void;
  setProjects: (projects: Project[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: null, 
  activeProjectId: null,
  activeRoom: 'idle',
  projects: [],
  setWorkspaceId: (id) => set({ workspaceId: id }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  setProjects: (projects) => set({ projects }),
}));
