import { create } from 'zustand';
import { erdSchema, backlogSchema } from '../schemas/projectImportSchemas';
import type { ErdTable, BacklogTicket } from '../schemas/projectImportSchemas';

interface StagingAreaState {
    stagedErd: ErdTable[];
    stagedBacklog: BacklogTicket[];
    
    // Actions
    loadFromJson: (seccion: 'erd' | 'backlog', jsonString: string) => { success: boolean; error?: string };
    
    // Generic handlers for both sections
    addItem: (seccion: 'erd' | 'backlog', item: any) => void;
    removeItem: (seccion: 'erd' | 'backlog', id: string) => void;
    updateItem: (seccion: 'erd' | 'backlog', id: string, newData: any) => void;
    
    reset: () => void;
}

export const useStagingAreaStore = create<StagingAreaState>((set) => ({
    stagedErd: [],
    stagedBacklog: [],

    loadFromJson: (seccion, jsonString) => {
        try {
            const rawData = JSON.parse(jsonString);
            
            if (seccion === 'erd') {
                const validated = erdSchema.parse(rawData);
                set({ stagedErd: validated });
            } else {
                const validated = backlogSchema.parse(rawData);
                set({ stagedBacklog: validated });
            }
            
            return { success: true };
        } catch (err: any) {
            console.error("Validation Error:", err);
            return { 
                success: false, 
                error: err.errors ? err.errors[0].message : "Formato JSON inválido" 
            };
        }
    },

    addItem: (seccion, item) => set((state) => ({
        [seccion === 'erd' ? 'stagedErd' : 'stagedBacklog']: [
            ...state[seccion === 'erd' ? 'stagedErd' : 'stagedBacklog'],
            { ...item, id: crypto.randomUUID() }
        ]
    })),

    removeItem: (seccion, id) => set((state) => ({
        [seccion === 'erd' ? 'stagedErd' : 'stagedBacklog']: state[seccion === 'erd' ? 'stagedErd' : 'stagedBacklog'].filter((x: any) => x.id !== id)
    })),

    updateItem: (seccion, id, newData) => set((state) => ({
        [seccion === 'erd' ? 'stagedErd' : 'stagedBacklog']: state[seccion === 'erd' ? 'stagedErd' : 'stagedBacklog'].map((x: any) => 
            x.id === id ? { ...x, ...newData } : x
        )
    })),

    reset: () => set({ stagedErd: [], stagedBacklog: [] })
}));
