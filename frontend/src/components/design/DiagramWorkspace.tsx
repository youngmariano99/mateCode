import { useState, useEffect } from 'react';
import { CodeEditorPane } from './CodeEditorPane';
import { VisualCanvas } from './VisualCanvas';
import { ParserService } from '../../services/agile/ParserService';
import type { DiagramNode, DiagramEdge } from '../../services/agile/ParserService';

export const DiagramWorkspace = () => {
    const [code, setCode] = useState<string>(`Table usuarios {\n  id uuid [pk]\n  email varchar\n}\n\nTable perfiles {\n  id uuid [pk]\n  usuario_id uuid [ref: > usuarios.id]\n  nombre varchar\n}`);
    const [elements, setElements] = useState<{ nodes: DiagramNode[], edges: DiagramEdge[] }>({ nodes: [], edges: [] });

    useEffect(() => {
        const parsed = ParserService.parseDBML(code);
        setElements(parsed);
    }, [code]);

    return (
        <div className="flex h-[70vh] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Panel Izquierdo: Editor */}
            <div className="w-1/3 border-r border-zinc-800 flex flex-col">
                <div className="p-3 bg-zinc-800/50 border-b border-zinc-700 flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Editor DBML</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <CodeEditorPane code={code} onChange={setCode} />
            </div>

            {/* Panel Derecho: Lienzo React Flow */}
            <div className="flex-1 bg-zinc-950 relative">
                <VisualCanvas nodes={elements.nodes} edges={elements.edges} />

                {/* Micro-copy educativo */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg backdrop-blur-md">
                    <p className="text-xs text-emerald-400 font-medium">
                        <span className="font-bold">💡 Mentor Argentino:</span> "Armá tu base de datos acá en formato DBML. Si dejás esto bien armadito, cuando te toque programar el Backend, la IA ya va a saber exactamente cómo se llaman todas tus columnas. ¡Un lujo!"
                    </p>
                </div>
            </div>
        </div>
    );
};
