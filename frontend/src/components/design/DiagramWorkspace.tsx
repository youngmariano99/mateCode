import { useState, useEffect } from 'react';
import { CodeEditorPane } from './CodeEditorPane';
import { VisualCanvas } from './VisualCanvas';
import { ParserService } from '../../services/agile/ParserService';
import type { DiagramNode, DiagramEdge } from '../../services/agile/ParserService';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { Monitor, RefreshCcw, Maximize2, Minimize2, Zap, Save, LayoutList } from 'lucide-react';
import { GeneradorPromptDesignModal } from './GeneradorPromptDesignModal';
import { UniversalErdWorkspace } from './UniversalErdWorkspace';
import { UniversalSitemapBrandingWorkspace } from './UniversalSitemapBrandingWorkspace';
import { RolesMatrixView } from './RolesMatrixView';


type DiagramType = 'ERD' | 'UML' | 'SITEMAP' | 'ROLES';

const DEFAULT_CODES: Record<DiagramType, string> = {
    ERD: JSON.stringify({
        project_name: 'Database Principal',
        default_engine: 'postgresql',
        tables: [
            { id: 't1', name: 'usuarios', columns: [{ name: 'id', data_family: 'uuid', is_primary_key: true }, { name: 'email', data_family: 'string' }] }
        ],
        relationships: []
    }, null, 2),
    UML: `@startuml\nactor "Usuario" as U\nusecase "Login" as UC1\nU --> UC1\n@enduml`,
    SITEMAP: `{\n  "sitemap": {\n    "home": {\n      "sections": [\n        { "name": "Dashboard" }\n      ]\n    }\n  }\n}`,
    ROLES: JSON.stringify({
        roles: [
            { name: "Administrador", description: "Acceso total al sistema y configuraciones globales.", permissions: ["*"] },
            { name: "Usuario", description: "Acceso limitado a sus propios datos y funciones básicas.", permissions: ["perfil:read", "perfil:update"] }
        ],
        permission_matrix: {
            "Administrador": ["*"],
            "Usuario": ["perfil:read", "perfil:update"]
        }
    }, null, 2)
};

import { useWorkspaceStore } from '../../store/useWorkspaceStore';

export const DiagramWorkspace = () => {
    const { id: paramProjectId } = useParams();
    const activeProjectId = useWorkspaceStore(state => state.activeProjectId);
    
    // Prioridad: Store (Spatial) > Params
    const projectId = activeProjectId || paramProjectId;
    
    const [activeTab, setActiveTab] = useState<DiagramType>('ERD');
    const [codes, setCodes] = useState<Record<DiagramType, string>>(DEFAULT_CODES);
    const [elements, setElements] = useState<{ nodes: DiagramNode[], edges: DiagramEdge[] }>({ nodes: [], edges: [] });
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // ... funciones de exportación (las definiremos mejor abajo o en componentes)
    const exportAsImage = async () => {
        const element = document.getElementById('visual-area');
        if (!element) return;
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(element, { backgroundColor: '#09090b', quality: 1 });
        const link = document.createElement('a');
        link.download = `MateCode_${activeTab}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    };

    const exportAsPDF = () => {
        window.print();
    };

    // Cargar diagramas al iniciar
    useEffect(() => {
        const loadDiagrams = async () => {
            if (!projectId) return;
            try {
                setLoading(true);
                const data: any[] = await api.get(`/Diagram/project/${projectId}`);
                const newCodes = { ...DEFAULT_CODES };
                data.forEach(d => {
                    const type = d.tipo.toUpperCase() as DiagramType;
                    if (newCodes[type] !== undefined) {
                        newCodes[type] = d.contenidoCodigo;
                    }
                });
                setCodes(newCodes);
                setDataLoaded(true);
            } catch (err) {
                console.error("Error cargando diagramas", err);
            } finally {
                setLoading(false);
            }
        };
        loadDiagrams();
    }, [projectId]);

    // Parsear código dinámicamente según la pestaña activa (para las que no son Universal ERD)
    useEffect(() => {
        if (activeTab === 'ERD') return;

        const currentCode = codes[activeTab];
        let parsed = { nodes: [], edges: [] };

        if (activeTab === 'UML') parsed = ParserService.parsePlantUML(currentCode);
        else if (activeTab === 'SITEMAP') parsed = ParserService.parseSitemap(currentCode);
        else if (activeTab === 'ROLES') parsed = ParserService.parseRoles(currentCode);

        setElements(parsed);
    }, [activeTab, codes]);

    const handleSave = async () => {
        if (!projectId) return;
        setIsSaving(true);
        try {
            await api.put(`/Diagram/project/${projectId}/${activeTab}`, { codigo: codes[activeTab] });
            Swal.fire({
                icon: 'success',
                title: 'Diseño Guardado',
                text: 'El plano se ha sincronizado correctamente.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                background: '#18181b',
                color: '#fff'
            });
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar el diseño', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const containerHeight = isFullscreen ? 'h-screen' : 'h-[85vh]';

    return (
        <div className={`p-6 space-y-6 bg-black min-h-screen ${isFullscreen ? 'fixed inset-0 z-[9999] overflow-hidden' : ''}`}>
            {/* Header del Espacio de Trabajo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-xl">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Monitor className="text-emerald-500" />
                        ORÁCULO DE DISEÑO <span className="text-zinc-600">/</span> {activeTab}
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1 font-medium italic">"Donde la estrategia se convierte en arquitectura."</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex bg-zinc-800 rounded-xl p-1 border border-zinc-700">
                        <button onClick={exportAsImage} className="p-2.5 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all" title="Exportar PNG"><Maximize2 size={16} /></button>
                        <button onClick={exportAsPDF} className="p-2.5 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all" title="Exportar PDF/Imprimir"><Monitor size={16} /></button>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-3 rounded-xl transition-all border ${isSidebarOpen ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'}`}
                        title={isSidebarOpen ? "Ocultar Editor" : "Mostrar Editor"}
                    >
                        <LayoutList size={20} />
                    </button>

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all border border-zinc-700"
                        title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button 
                        onClick={() => setIsPromptModalOpen(true)}
                        className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm border border-zinc-700 group"
                    >
                        <Zap size={18} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                        IA PROMPT
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl flex items-center gap-2 transition-all font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isSaving ? 'SAVE' : 'GUARDAR'}
                    </button>
                </div>
            </div>

            {/* Selector de Tablero */}
            <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit">
                {['ERD', 'UML', 'SITEMAP', 'ROLES'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all tracking-widest ${
                            activeTab === tab 
                                ? 'bg-emerald-500 text-black shadow-lg' 
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={`${containerHeight} flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse`}>
                    <RefreshCcw className="animate-spin text-emerald-500 mb-4" size={48} />
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Sincronizando Planos...</p>
                </div>
            ) : (
                <>
                {activeTab === 'ERD' ? (
                    <div id="visual-area" className={`${containerHeight} bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative`}>
                        {dataLoaded && (
                            <UniversalErdWorkspace 
                                initialCode={codes.ERD} 
                                onCodeChange={(newCode) => setCodes(prev => ({ ...prev, ERD: newCode }))} 
                            />
                        )}
                    </div>
                ) : (
                    <div className={`flex ${containerHeight} bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative group`}>
                        {/* Panel Izquierdo: Editor (Condicional) */}
                        {isSidebarOpen && (
                            <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-950/50 animate-in slide-in-from-left duration-300">
                                <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Editor de Código ({activeTab})</span>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                </div>
                                <CodeEditorPane
                                    code={codes[activeTab]}
                                    onChange={(val) => setCodes(prev => ({ ...prev, [activeTab]: val }))}
                                />
                            </div>
                        )}

                        {/* Panel Derecho: VisualArea (Sitemap, Roles o UML) */}
                        <div id="visual-area" className="flex-1 bg-zinc-950 relative overflow-hidden">
                            {activeTab === 'ROLES' ? (
                                <RolesMatrixView code={codes.ROLES} />
                            ) : activeTab === 'SITEMAP' ? (
                                <UniversalSitemapBrandingWorkspace 
                                    initialCode={codes.SITEMAP} 
                                    onCodeChange={(newCode) => setCodes(prev => ({ ...prev, SITEMAP: newCode }))} 
                                />
                            ) : (
                                <VisualCanvas nodes={elements.nodes} edges={elements.edges} />
                            )}
                        </div>
                    </div>
                )}
                </>
            )}

            {/* Micro-copy Mentor Argentino - Fuera del diagrama */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl backdrop-blur-xl">
                <p className="text-xs text-emerald-400/80 leading-relaxed font-medium">
                    <span className="font-bold text-emerald-400">💡 Mentor Argentino:</span> "Che, si no tenés ganas de escribir, hacé clic en el botón de arriba. Copiás el prompt, se lo tirás a tu IA favorita, y cuando te devuelva el código lo pegás acá. ¡Queda todo guardado y sincronizado!"
                </p>
            </div>

            {isPromptModalOpen && projectId && (
                <GeneradorPromptDesignModal
                    projectId={projectId}
                    diagramType={activeTab}
                    onClose={() => setIsPromptModalOpen(false)}
                />
            )}
        </div>
    );
};
