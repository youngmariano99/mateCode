import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AdnBlock {
    nombre: string;
    proposito: string;
    vision: string;
    publico: string;
    diferenciador: string;
}

export interface FuncionalBlock {
    modulos: string;
    flujos: string;
    funcionalidadesMust: string;
    wishlist: string;
    comunicacion: string;
}

export interface DisenoBlock {
    entidades: string;
    sitemap: string;
    roles: string;
    uml: string;
}

export interface StackBlock {
    plataforma: string;
    backend: string;
    frontend: string;
    bdd: string;
    librerias_back: string;
    librerias_front: string;
    testing: string;
    despliegue: string;
    infra: string;
}

export interface CalidadBlock {
    auth: string;
    rbac: string;
    estandares: string;
    legal: string;
}

export interface GestionBlock {
    hitos: string;
    presupuesto: string;
    riesgos: string;
}

export interface TechItem {
    id: string;
    categoriaPrincipal: string;
    nombre: string;
    version?: string;
}

export interface ProjectBlueprintState {
    adn: AdnBlock;
    funcional: FuncionalBlock;
    diseno: DisenoBlock;
    stack: StackBlock;
    techStack: TechItem[];
    calidad: CalidadBlock;
    gestion: GestionBlock;
    respuestasContexto: Record<string, string>;
    
    // Actions
    updateAdn: (data: Partial<AdnBlock>) => void;
    updateFuncional: (data: Partial<FuncionalBlock>) => void;
    updateDiseno: (data: Partial<DisenoBlock>) => void;
    updateStack: (data: Partial<StackBlock>) => void;
    updateTechStack: (techs: TechItem[]) => void;
    updateCalidad: (data: Partial<CalidadBlock>) => void;
    updateGestion: (data: Partial<GestionBlock>) => void;
    updateRespuestaContexto: (id: string, valor: string) => void;
    reset: () => void;
}

const initialValues = {
    adn: { nombre: '', proposito: '', vision: '', publico: '', diferenciador: '' },
    funcional: { modulos: '', flujos: '', funcionalidadesMust: '', wishlist: '', comunicacion: '' },
    diseno: { entidades: '', sitemap: '', roles: '', uml: '' },
    stack: { plataforma: '', backend: '', frontend: '', bdd: '', librerias_back: '', librerias_front: '', testing: '', despliegue: '', infra: '' },
    techStack: [],
    calidad: { auth: '', rbac: '', estandares: '', legal: '' },
    gestion: { hitos: '', presupuesto: '', riesgos: '' },
    respuestasContexto: {}
};

export const useProjectBlueprintStore = create<ProjectBlueprintState>()(
    persist(
        (set) => ({
            ...initialValues,

            updateAdn: (data) => set((state) => ({ adn: { ...state.adn, ...data } })),
            updateFuncional: (data) => set((state) => ({ funcional: { ...state.funcional, ...data } })),
            updateDiseno: (data) => set((state) => ({ diseno: { ...state.diseno, ...data } })),
            updateStack: (data) => set((state) => ({ stack: { ...state.stack, ...data } })),
            updateTechStack: (techs) => set(() => ({ techStack: techs })),
            updateCalidad: (data) => set((state) => ({ calidad: { ...state.calidad, ...data } })),
            updateGestion: (data) => set((state) => ({ gestion: { ...state.gestion, ...data } })),
            updateRespuestaContexto: (id, valor) => set((state) => ({ 
                respuestasContexto: { ...state.respuestasContexto, [id]: valor } 
            })),
            
            reset: () => set(initialValues)
        }),
        {
            name: 'matecode-blueprint-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
