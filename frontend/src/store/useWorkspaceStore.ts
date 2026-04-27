import { create } from 'zustand';

interface WorkspaceState {
  workspaceId: string | null;
  activeProjectId: string | null;
  activeRoom: string;
  setWorkspaceId: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveRoom: (room: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: 'default-workspace', // Placeholder inicial
  activeProjectId: null,
  activeRoom: 'idle',
  setWorkspaceId: (id) => set({ workspaceId: id }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveRoom: (room) => set({ activeRoom: room }),
}));
