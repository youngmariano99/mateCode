import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, type Node, type Edge, type OnNodesChange, type OnEdgesChange, useReactFlow, ReactFlowProvider, getNodesBounds } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng, toSvg } from 'html-to-image';
import { Image as ImageIcon, FileCode } from 'lucide-react';
import { DatabaseNode } from './DatabaseNode';
import { ActorNode, UseCaseNode, SystemNode, ParticipantNode } from './UmlNodes';
import type { DiagramNode, DiagramEdge } from '../../services/agile/ParserService';
import { getLayoutedElements } from '../../services/agile/LayoutService';

interface VisualCanvasProps {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
}

const nodeTypes = {
    database: DatabaseNode,
    actor: ActorNode,
    usecase: UseCaseNode,
    system: SystemNode,
    participant: ParticipantNode
};

const CanvasInner = ({ nodes: initialNodes, edges: initialEdges }: VisualCanvasProps) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { getNodes } = useReactFlow();

    // Sincronizar y aplicar Layout automático
    useEffect(() => {
        if (initialNodes.length === 0) return;
        
        const isSequence = initialNodes.some(n => n.type === 'participant');
        const direction = isSequence ? 'TB' : 'LR';

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes as Node[], 
            initialEdges as Edge[],
            direction
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [initialNodes, initialEdges]);

    const onNodesChange: OnNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange: OnEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const exportImage = async (type: 'png' | 'svg') => {
        const nodes = getNodes();
        if (nodes.length === 0) return;

        const bounds = getNodesBounds(nodes);
        const element = document.querySelector('.react-flow__viewport') as HTMLElement;

        if (element) {
            const width = bounds.width + 200;
            const height = bounds.height + 200;
            
            const options = {
                backgroundColor: '#ffffff',
                width: width,
                height: height,
                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `translate(${-bounds.x + 100}px, ${-bounds.y + 100}px)`,
                },
            };

            const dataUrl = type === 'png' ? await toPng(element, options) : await toSvg(element, options);
            const link = document.createElement('a');
            link.download = `MateCode-Diagram-${new Date().getTime()}.${type}`;
            link.href = dataUrl;
            link.click();
        }
    };

    return (
        <div className="w-full h-full bg-zinc-50 relative group">
            {/* Toolbar de Exportación */}
            <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => exportImage('png')}
                    className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-xl hover:bg-zinc-50 text-zinc-700 flex items-center gap-2 text-xs font-bold transition-all"
                    title="Exportar como PNG"
                >
                    <ImageIcon size={14} className="text-emerald-500" />
                    PNG
                </button>
                <button 
                    onClick={() => exportImage('svg')}
                    className="p-2.5 bg-white border border-zinc-200 rounded-xl shadow-xl hover:bg-zinc-50 text-zinc-700 flex items-center gap-2 text-xs font-bold transition-all"
                    title="Exportar como SVG"
                >
                    <FileCode size={14} className="text-blue-500" />
                    SVG
                </button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                colorMode="light"
                defaultEdgeOptions={{ 
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#27272a', strokeWidth: 2.5 }, 
                    labelStyle: { fill: '#18181b', fontWeight: 'bold', fontSize: 11 },
                    labelBgStyle: { fill: '#ffffff' },
                    labelBgPadding: [8, 4],
                    labelBgBorderRadius: 4
                }}
            >
                <Background color="#e4e4e7" gap={30} size={1} />
                <Controls className="bg-white border-zinc-200 fill-zinc-600 shadow-xl" />
                <MiniMap 
                    nodeColor="#27272a" 
                    maskColor="rgba(255, 255, 255, 0.7)"
                    className="bg-white border border-zinc-200 rounded-lg shadow-2xl"
                />
            </ReactFlow>
        </div>
    );
};

export const VisualCanvas = (props: VisualCanvasProps) => (
    <ReactFlowProvider>
        <CanvasInner {...props} />
    </ReactFlowProvider>
);
