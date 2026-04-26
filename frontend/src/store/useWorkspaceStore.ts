import { create } from 'zustand';

interface WorkspaceState {
  workspaceId: string | null;
  activeProjectId: string | null;
  activeRoom: 'idle' | 'reception' | 'library' | 'team' | 'vault' | 'phase00' | 'phase01' | 'phase02' | 'phase03' | 'phase04' | 'server';
  setWorkspaceId: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveRoom: (room: WorkspaceState['activeRoom']) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: 'default-workspace', // Placeholder inicial
  activeProjectId: null,
  activeRoom: 'idle',
  setWorkspaceId: (id) => set({ workspaceId: id }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveRoom: (room) => set({ activeRoom: room }),
}));
