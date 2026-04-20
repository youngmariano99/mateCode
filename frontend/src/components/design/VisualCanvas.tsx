import { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { DiagramNode, DiagramEdge } from '../../services/agile/ParserService';

interface VisualCanvasProps {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
}

export const VisualCanvas = ({ nodes, edges }: VisualCanvasProps) => {
    // Memorizar para evitar re-calculos costosos en cada render de React Flow
    const initialNodes = useMemo(() => nodes, [nodes]);
    const initialEdges = useMemo(() => edges, [edges]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={initialNodes}
                edges={initialEdges}
                fitView
                colorMode="dark"
                defaultEdgeOptions={{ 
                    animated: true,
                    style: { stroke: '#10b981' } // emerald-500
                }}
            >
                <Background color="#27272a" gap={20} />
                <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-400" />
                <MiniMap 
                    nodeColor="#3f3f46" 
                    maskColor="rgba(0, 0, 0, 0.5)"
                    className="bg-zinc-900 border border-zinc-800 rounded-lg"
                />
            </ReactFlow>
        </div>
    );
};
