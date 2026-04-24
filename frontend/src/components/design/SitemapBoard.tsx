import React, { useMemo, useCallback, useEffect } from 'react';
import { 
    ReactFlow,
    Background, 
    Controls, 
    Handle, 
    Position,
    type NodeProps,
    addEdge,
    type Connection,
    type Edge,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layout, Zap, Plus, FileText, Trash2, ShieldCheck, User, RefreshCcw } from 'lucide-react';
import type { UniversalSitemap, PageDef } from '../../services/design/SitemapBrandingTypes';
import Swal from 'sweetalert2';

// Custom Node for Sitemap Pages
const SitemapNode = ({ data }: NodeProps & { data: { 
    page: PageDef, 
    onAddSection: (id: string) => void, 
    onRemoveSection: (pId: string, sId: string) => void,
    onToggleRole: (pId: string, sId: string | null, role: string) => void 
} }) => {
    
    const handleAddRole = (sectionId: string | null) => {
        Swal.fire({
            title: 'Asignar Rol',
            input: 'text',
            inputPlaceholder: 'Ej: Admin, Colono...',
            showCancelButton: true,
            background: '#18181b', color: '#fff'
        }).then(result => {
            if (result.value) data.onToggleRole(data.page.id, sectionId, result.value);
        });
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl min-w-[300px] shadow-2xl overflow-hidden group hover:border-emerald-500/50 transition-all">
            <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3 !-top-1.5 border-2 border-zinc-900" />
            
            {/* Header */}
            <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="p-1 bg-emerald-500/10 rounded text-emerald-500"><Layout size={12} /></span>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{data.page.name}</h4>
                    </div>
                    <button onClick={() => handleAddRole(null)} className="text-zinc-500 hover:text-emerald-500 transition-colors">
                        <ShieldCheck size={14} />
                    </button>
                </div>
                <span className="text-[9px] font-mono text-emerald-500/70">{data.page.route}</span>
                
                {/* Page Roles */}
                {data.page.roles && data.page.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {data.page.roles.map(role => (
                            <span key={role} className="px-1.5 py-0.5 bg-zinc-950 text-[8px] font-black text-emerald-400 border border-emerald-500/20 rounded-md flex items-center gap-1">
                                <User size={8} /> {role}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Sections List */}
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                {data.page.sections.map(section => (
                    <div key={section.id} className="bg-zinc-950/50 border border-zinc-800/50 p-3 rounded-xl border-l-2 border-l-emerald-500 relative group/sec hover:bg-zinc-900/50 transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <FileText size={10} className="text-zinc-600" />
                                <h5 className="text-[10px] font-bold text-zinc-300">{section.title}</h5>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/sec:opacity-100 transition-opacity">
                                <button onClick={() => handleAddRole(section.id)} className="text-zinc-600 hover:text-emerald-400"><ShieldCheck size={10} /></button>
                                <button onClick={() => data.onRemoveSection(data.page.id, section.id)} className="text-zinc-600 hover:text-red-400"><Trash2 size={10} /></button>
                            </div>
                        </div>
                        <p className="text-[9px] text-zinc-500 leading-tight line-clamp-2 italic mb-2">{section.description}</p>
                        
                        {/* Section Roles */}
                        {section.roles && section.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {section.roles.map(role => (
                                    <span key={role} className="px-1.5 py-0.5 bg-zinc-900 text-[7px] font-bold text-zinc-400 border border-white/5 rounded-full">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                
                <button 
                    onClick={() => data.onAddSection(data.page.id)}
                    className="w-full py-2 border border-dashed border-zinc-800 rounded-lg text-[9px] font-bold text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={10} /> Nueva Sección
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3 !-bottom-1.5 border-2 border-zinc-900" />
        </div>
    );
};

const nodeTypes = {
    sitemapPage: SitemapNode
};

interface Props {
    sitemap: UniversalSitemap;
    onChange: (newSitemap: UniversalSitemap) => void;
}

const SitemapFlowInner: React.FC<Props> = ({ sitemap, onChange }) => {
    const { fitView } = useReactFlow();

    // Transformar el Sitemap JSON en nodos y aristas con algoritmo de subárboles
    const { initialNodes, initialEdges } = useMemo(() => {
        if (!sitemap?.pages || sitemap.pages.length === 0) return { initialNodes: [], initialEdges: [] };
        
        const nodes: any[] = [];
        const edges: any[] = [];
        const pages = sitemap.pages;

        // 1. Calcular el ancho de cada subárbol recursivamente
        const subtreeWidths = new Map<string, number>();
        const calculateWidth = (pageId: string): number => {
            const children = pages.filter(p => p.parentId === pageId);
            if (children.length === 0) {
                subtreeWidths.set(pageId, 1);
                return 1;
            }
            const width = children.reduce((acc, child) => acc + calculateWidth(child.id), 0);
            subtreeWidths.set(pageId, width);
            return width;
        };

        // Encontrar raíces y calcular sus anchos
        const roots = pages.filter(p => !p.parentId);
        roots.forEach(root => calculateWidth(root.id));

        // 2. Posicionar nodos basados en el ancho acumulado
        const processed = new Set<string>();
        const NODE_WIDTH = 450;
        const NODE_HEIGHT = 600;

        const positionNode = (page: PageDef, depth: number, xStart: number) => {
            if (processed.has(page.id)) return;
            processed.add(page.id);

            const myWidth = subtreeWidths.get(page.id) || 1;
            // Centro el nodo actual sobre el espacio total que ocupan sus hijos
            const xPos = xStart + (myWidth * NODE_WIDTH) / 2 - (300 / 2); // 300 es el min-width del nodo

            nodes.push({
                id: page.id,
                type: 'sitemapPage',
                data: { 
                    page,
                    onAddSection: (pId: string) => {
                        const newSection = { id: `s_${Date.now()}`, title: 'Nueva Sección', description: '...' };
                        const updated = (sitemap.pages || []).map(p => p.id === pId ? { ...p, sections: [...p.sections, newSection] } : p);
                        onChange({ ...sitemap, pages: updated });
                    },
                    onRemoveSection: (pId: string, sId: string) => {
                        const updated = (sitemap.pages || []).map(p => p.id === pId ? { ...p, sections: p.sections.filter(s => s.id !== sId) } : p);
                        onChange({ ...sitemap, pages: updated });
                    },
                    onToggleRole: (pId: string, sId: string | null, role: string) => {
                        const updated = (sitemap.pages || []).map(p => {
                            if (p.id !== pId) return p;
                            if (sId === null) {
                                const currentRoles = p.roles || [];
                                const newRoles = currentRoles.includes(role) ? currentRoles.filter(r => r !== role) : [...currentRoles, role];
                                return { ...p, roles: newRoles };
                            } else {
                                const updatedSections = p.sections.map(s => {
                                    if (s.id !== sId) return s;
                                    const currentRoles = s.roles || [];
                                    const newRoles = currentRoles.includes(role) ? currentRoles.filter(r => r !== role) : [...currentRoles, role];
                                    return { ...s, roles: newRoles };
                                });
                                return { ...p, sections: updatedSections };
                            }
                        });
                        onChange({ ...sitemap, pages: updated });
                    }
                },
                position: { x: xPos, y: depth * NODE_HEIGHT }
            });

            if (page.parentId) {
                edges.push({
                    id: `e_${page.parentId}_${page.id}`,
                    source: page.parentId,
                    target: page.id,
                    animated: true,
                    style: { stroke: '#10b981', strokeWidth: 2 }
                });
            }

            // Procesar hijos, repartiendo el xStart proporcionalmente a sus anchos
            let currentX = xStart;
            const children = pages.filter(p => p.parentId === page.id);
            children.forEach(child => {
                const childWidth = subtreeWidths.get(child.id) || 1;
                positionNode(child, depth + 1, currentX);
                currentX += childWidth * NODE_WIDTH;
            });
        };

        // Posicionar todas las raíces
        let rootX = 0;
        roots.forEach(root => {
            const width = subtreeWidths.get(root.id) || 1;
            positionNode(root, 0, rootX);
            rootX += width * NODE_WIDTH + 100; // Un poco de espacio entre árboles
        });

        return { initialNodes: nodes, initialEdges: edges };
    }, [sitemap, onChange]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback((params: Connection) => {
        const { source, target } = params;
        if (!source || !target) return;

        const updatedPages = (sitemap.pages || []).map(p => 
            p.id === target ? { ...p, parentId: source } : p
        );
        onChange({ ...sitemap, pages: updatedPages });
    }, [sitemap, onChange]);

    const handleImportJson = async () => {
        const { value: jsonStr } = await Swal.fire({
            title: '🚀 Importar Sitemap (JSON)',
            input: 'textarea',
            inputPlaceholder: 'Pegá el JSON del sitemap aquí...',
            showCancelButton: true,
            background: '#18181b', color: '#fff'
        });

        if (jsonStr) {
            try {
                const parsed = JSON.parse(jsonStr);
                onChange(parsed);
                Swal.fire({ icon: 'success', title: 'Sitemap Actualizado', background: '#18181b', color: '#fff' });
            } catch {
                Swal.fire({ icon: 'error', title: 'JSON Inválido', background: '#18181b', color: '#fff' });
            }
        }
    };

    const addPage = () => {
        const newPage: PageDef = { id: `p_${Date.now()}`, name: 'Nueva Página', route: '/...', sections: [] };
        onChange({ ...sitemap, pages: [...(sitemap.pages || []), newPage] });
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950/50 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            {/* Toolbar */}
            <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex justify-between items-center backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Layout className="text-emerald-500" size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Wiremap Flow</h3>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Visual Architect Engine</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            setNodes(initialNodes);
                            setEdges(initialEdges);
                            setTimeout(() => fitView({ padding: 0.4, duration: 800 }), 100);
                        }}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                        title="Auto-Organizar"
                    >
                        <RefreshCcw size={14} /> Re-Acomodar
                    </button>
                    <button onClick={handleImportJson} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
                        <Zap size={14} /> Importar IA
                    </button>
                    <button 
                        onClick={addPage} 
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> Nueva Página
                    </button>
                </div>
            </div>

            {/* Diagram Area */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    defaultEdgeOptions={{ 
                        type: 'step', 
                        style: { stroke: '#10b981', strokeWidth: 2, opacity: 0.6 },
                        animated: true 
                    }}
                    colorMode="dark"
                    minZoom={0.05}
                    maxZoom={2}
                    fitView
                    fitViewOptions={{ padding: 0.4 }}
                >
                    <Background color="#27272a" gap={20} />
                    <Controls className="bg-zinc-900 border-zinc-800 fill-white" />
                </ReactFlow>
            </div>
        </div>
    );
};

export const SitemapBoard: React.FC<Props> = (props) => (
    <ReactFlowProvider>
        <SitemapFlowInner {...props} />
    </ReactFlowProvider>
);
