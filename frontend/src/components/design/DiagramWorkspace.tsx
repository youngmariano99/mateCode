import { useState, useEffect } from 'react';
import { CodeEditorPane } from './CodeEditorPane';
import { VisualCanvas } from './VisualCanvas';
import { ParserService } from '../../services/agile/ParserService';
import type { DiagramNode, DiagramEdge } from '../../services/agile/ParserService';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { GeneradorPromptDesignModal } from './GeneradorPromptDesignModal';


type DiagramType = 'ERD' | 'UML' | 'SITEMAP' | 'ROLES';

const DEFAULT_CODES: Record<DiagramType, string> = {
    ERD: `Table usuarios {\n  id uuid [pk]\n  email varchar\n}\n\nTable perfiles {\n  id uuid [pk]\n  usuario_id uuid [ref: > usuarios.id]\n  nombre varchar\n}`,
    UML: `@startuml\nactor "Usuario" as U\nusecase "Login" as UC1\nU --> UC1\n@enduml`,
    SITEMAP: `{\n  "sitemap": {\n    "home": {\n      "sections": [\n        { "name": "Dashboard" }\n      ]\n    }\n  }\n}`,
    ROLES: `{\n  "roles": [\n    { "name": "Admin", "permissions": ["all"] }\n  ]\n}`
};

export const DiagramWorkspace = () => {
    const { id: projectId } = useParams();
    const [activeTab, setActiveTab] = useState<DiagramType>('ERD');
    const [codes, setCodes] = useState<Record<DiagramType, string>>(DEFAULT_CODES);
    const [elements, setElements] = useState<{ nodes: DiagramNode[], edges: DiagramEdge[] }>({ nodes: [], edges: [] });
    const [isSaving, setIsSaving] = useState(false);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

    // Cargar diagramas al iniciar
    useEffect(() => {
        const loadDiagrams = async () => {
            if (!projectId) return;
            try {
                const data: any[] = await api.get(`/Diagram/project/${projectId}`);
                const newCodes = { ...DEFAULT_CODES };
                data.forEach(d => {
                    const type = d.tipo.toUpperCase() as DiagramType;
                    if (newCodes[type] !== undefined) {
                        newCodes[type] = d.contenidoCodigo;
                    }
                });
                setCodes(newCodes);
            } catch (err) {
                console.error("Error cargando diagramas", err);
            }
        };
        loadDiagrams();
    }, [projectId]);

    // Parsear código dinámicamente según la pestaña activa
    useEffect(() => {
        const currentCode = codes[activeTab];
        let parsed = { nodes: [], edges: [] };

        if (activeTab === 'ERD') parsed = ParserService.parseDBML(currentCode);
        else if (activeTab === 'UML') parsed = ParserService.parsePlantUML(currentCode);
        else if (activeTab === 'SITEMAP') parsed = ParserService.parseSitemap(currentCode);

        setElements(parsed);
    }, [activeTab, codes]);

    const handleSave = async () => {
        if (!projectId) return;
        setIsSaving(true);
        try {
            await api.put(`/Diagram/project/${projectId}/${activeTab}`, { codigo: codes[activeTab] });
            Swal.fire({
                icon: 'success',
                title: 'Diagrama guardado',
                toast: true,
                position: 'top-end',
                timer: 2000,
                showConfirmButton: false,
                background: '#18181b',
                color: '#fff'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header con Tabs y Botones */}
            <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl border border-zinc-800 shadow-xl">
                <div className="flex gap-1">
                    {(['ERD', 'UML', 'SITEMAP', 'ROLES'] as DiagramType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsPromptModalOpen(true)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border border-emerald-500/20 shadow-lg"
                    >
                        <span>💡 Obtener Prompt para IA</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-xl"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Diseño'}
                    </button>
                </div>
            </div>

            <div className="flex h-[75vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative group">
                {/* Panel Izquierdo: Editor */}
                <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
                    <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Editor de Código ({activeTab})</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    </div>
                    <CodeEditorPane
                        code={codes[activeTab]}
                        onChange={(val) => setCodes(prev => ({ ...prev, [activeTab]: val }))}
                    />
                </div>

                {/* Panel Derecho: VisualCanvas */}
                <div className="flex-1 bg-zinc-950 relative overflow-hidden">
                    <VisualCanvas nodes={elements.nodes} edges={elements.edges} />

                    {/* Micro-copy Mentor Argentino */}
                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl backdrop-blur-xl group-hover:border-emerald-500/30 transition-all duration-500">
                        <p className="text-xs text-emerald-400/80 leading-relaxed font-medium">
                            <span className="font-bold text-emerald-400">💡 Mentor Argentino:</span> "Che, si no tenés ganas de escribir, hacé clic en el botón de arriba. Copiás el prompt, se lo tirás a tu IA favorita, y cuando te devuelva el código lo pegás acá. ¡Queda todo guardado y sincronizado!"
                        </p>
                    </div>
                </div>
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
