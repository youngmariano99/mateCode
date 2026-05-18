import React from 'react';
import { Download, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import { useProjectBlueprintStore } from '../../store/useProjectBlueprintStore';
import type { TechItem } from '../../store/useProjectBlueprintStore';

interface Estandar {
    id: string;
    categoria: string;
    nombre: string;
    descripcionDidactica: string;
}

interface PromptBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    projectDescription: string;
    selectedStandards: Estandar[];
}

export const PromptBuilderModal: React.FC<PromptBuilderModalProps> = ({
    isOpen,
    onClose,
    projectName,
    projectDescription,
    selectedStandards
}) => {
    const { techStack } = useProjectBlueprintStore();

    if (!isOpen) return null;

    const generateContextMarkdown = (
        standards: Estandar[],
        stack: TechItem[],
        context: string
    ): string => {
        // Agrupar estándares por categoría
        const groupedStandards = standards.reduce((acc, curr) => {
            if (!acc[curr.categoria]) acc[curr.categoria] = [];
            acc[curr.categoria].push(curr);
            return acc;
        }, {} as Record<string, Estandar[]>);

        // Generar diagrama Mermaid dinámico si hay componentes en el stack
        let mermaidStr = '';
        if (stack.length > 0) {
            mermaidStr += `    \`\`\`mermaid\n`;
            mermaidStr += `    graph TD\n`;

            const frontends = stack.filter(t => t.categoriaPrincipal.toLowerCase() === 'frontend');
            const backends = stack.filter(t => t.categoriaPrincipal.toLowerCase() === 'backend');
            const databases = stack.filter(t => t.categoriaPrincipal.toLowerCase() === 'base de datos' || t.categoriaPrincipal.toLowerCase() === 'database');

            if (frontends.length > 0) {
                mermaidStr += `    subgraph Frontend [Capa de Presentación]\n`;
                frontends.forEach(f => mermaidStr += `        ${f.id.substring(0, 6)}[${f.nombre}]\n`);
                mermaidStr += `    end\n`;
            }

            if (backends.length > 0) {
                mermaidStr += `    subgraph Backend [Lógica de Negocio]\n`;
                backends.forEach(b => mermaidStr += `        ${b.id.substring(0, 6)}(${b.nombre})\n`);
                mermaidStr += `    end\n`;
            }

            if (databases.length > 0) {
                mermaidStr += `    subgraph Database [Persistencia]\n`;
                databases.forEach(d => mermaidStr += `        ${d.id.substring(0, 6)}[(${d.nombre})]\n`);
                mermaidStr += `    end\n`;
            }

            // Conexiones lógicas simples si existen las capas
            if (frontends.length > 0 && backends.length > 0) {
                mermaidStr += `    Frontend -->|HTTP/REST| Backend\n`;
            }
            if (backends.length > 0 && databases.length > 0) {
                mermaidStr += `    Backend -->|CRUD| Database\n`;
            }

            mermaidStr += `    \`\`\`\n`;
        }

        let md = `<contexto_maestro>\n`;

        md += `  <resumen_proyecto>\n`;
        md += `    ${context || 'Sin descripción de contexto definida.'}\n`;
        md += `  </resumen_proyecto>\n\n`;

        md += `  <stack_tecnologico>\n`;
        if (stack.length > 0) {
            const groupedStack = stack.reduce((acc, curr) => {
                if (!acc[curr.categoriaPrincipal]) acc[curr.categoriaPrincipal] = [];
                acc[curr.categoriaPrincipal].push(curr.nombre + (curr.version ? ` ${curr.version}` : ''));
                return acc;
            }, {} as Record<string, string[]>);

            Object.entries(groupedStack).forEach(([cat, items]) => {
                md += `    - ${cat}: ${items.join(', ')}\n`;
            });
        } else {
            md += `    Sin stack definido.\n`;
        }
        md += `  </stack_tecnologico>\n\n`;

        if (mermaidStr) {
            md += `  <arquitectura_topologia_mermaid>\n`;
            md += mermaidStr;
            md += `  </arquitectura_topologia_mermaid>\n\n`;
        }

        md += `  <reglas_globales_criticas>\n`;
        if (standards.length > 0) {
            Object.keys(groupedStandards).forEach(category => {
                md += `    <!-- ${category.toUpperCase()} -->\n`;
                groupedStandards[category].forEach(std => {
                    md += `    - ${std.nombre}: ${std.descripcionDidactica.replace(/\n/g, ' ')}\n`;
                });
            });
        } else {
            md += `    Sin reglas definidas.\n`;
        }
        md += `  </reglas_globales_criticas>\n`;

        md += `</contexto_maestro>`;

        return md;
    };

    const handleDownload = () => {
        const content = generateContextMarkdown(selectedStandards, techStack, projectDescription);
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];

        link.href = url;
        link.download = `${projectName.replace(/\s+/g, '_')}_Contexto_${dateStr}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.2)] flex flex-col max-h-[90vh]">
                <header className="p-10 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <Terminal size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Context <span className="text-emerald-500">Builder</span></h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Generador de Documentación de Ingeniería</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-2xl transition-all">✕</button>
                </header>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-start gap-6">
                        <Sparkles className="text-emerald-500 shrink-0" size={24} />
                        <div>
                            <h4 className="text-sm font-black text-white uppercase italic mb-2">Vista Previa del Compilador</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Esta herramienta consolida el <span className="text-emerald-400">ADN</span>, el <span className="text-emerald-400">Stack Tecnológico</span> y los <span className="text-emerald-400">Estándares</span> en un único archivo Markdown listo para ser inyectado en cualquier LLM o repositorio de arquitectura.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estructura del Documento</span>
                            <span className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
                                <CheckCircle2 size={12} /> Sync con Zustand
                            </span>
                        </div>
                        <div className="bg-zinc-950 rounded-[2.5rem] border border-zinc-800 p-10 font-mono text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap h-[350px] overflow-y-auto custom-scrollbar shadow-inner">
                            {generateContextMarkdown(selectedStandards, techStack, projectDescription)}
                        </div>
                    </div>
                </div>

                <footer className="p-8 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-10 py-4 bg-emerald-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3 active:scale-95"
                    >
                        <Download size={18} /> Descargar .MD
                    </button>
                </footer>
            </div>
        </div>
    );
};
