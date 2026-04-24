import dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const isSequence = nodes.some(n => n.type === 'participant');
    
    if (isSequence) {
        // --- SEQUENCE TIMELINE ENGINE ---
        // Identificar actores y participantes principales
        const actorsAndParticipants = nodes.filter(n => n.type === 'participant' || n.type === 'actor');
        const otherNodes = nodes.filter(n => n.type !== 'participant' && n.type !== 'actor' && n.type !== 'system');
        
        // 1. Posicionar participantes en una fila superior con mucho espacio
        const HORIZONTAL_SPACING = 400;
        const VERTICAL_START = 50;
        const STEP_HEIGHT = 100; // Más espacio vertical entre mensajes

        const participantPositions: Record<string, number> = {};
        
        const layoutedParticipants = actorsAndParticipants.map((node, index) => {
            const x = index * HORIZONTAL_SPACING;
            participantPositions[node.id] = x;
            return {
                ...node,
                position: { x, y: VERTICAL_START },
                draggable: true
            };
        });

        // 2. Crear "Anchor Nodes" invisibles para cada mensaje (edge) en la línea de tiempo
        const anchorNodes: Node[] = [];
        const timelineEdges: Edge[] = [];

        edges.forEach((edge, index) => {
            const stepY = VERTICAL_START + 150 + (index * STEP_HEIGHT);
            const sourceX = participantPositions[edge.source];
            const targetX = participantPositions[edge.target];

            if (sourceX !== undefined && targetX !== undefined) {
                const sourceAnchorId = `anchor-${edge.source}-${index}`;
                const targetAnchorId = `anchor-${edge.target}-${index}`;

                // Nodos invisibles en la línea de vida (eje central del participante)
                anchorNodes.push({
                    id: sourceAnchorId,
                    type: 'default',
                    data: { label: '' },
                    position: { x: sourceX + 90, y: stepY }, // 90 = centro del nodo de 180px
                    style: { width: 1, height: 1, opacity: 0, pointerEvents: 'none' }
                });

                anchorNodes.push({
                    id: targetAnchorId,
                    type: 'default',
                    data: { label: '' },
                    position: { x: targetX + 90, y: stepY },
                    style: { width: 1, height: 1, opacity: 0, pointerEvents: 'none' }
                });

                // El mensaje va de anclaje a anclaje en el mismo nivel Y
                timelineEdges.push({
                    ...edge,
                    id: `msg-${index}`,
                    source: sourceAnchorId,
                    target: targetAnchorId,
                    type: 'smoothstep',
                    animated: true
                });
            }
        });

        return { 
            nodes: [...layoutedParticipants, ...anchorNodes, ...otherNodes], 
            edges: timelineEdges 
        };
    }

    // --- CASE USE / DEFAULT LAYOUT (DAGRE) ---
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ 
        rankdir: direction, 
        ranksep: 180, // Aumentamos espacio entre columnas
        nodesep: 100  // Aumentamos espacio entre filas
    });

    const layoutableNodes = nodes.filter(n => n.type !== 'system');
    const systemNodes = nodes.filter(n => n.type === 'system');

    layoutableNodes.forEach((node) => {
        let width = 180; // Más ancho para que el texto no se corte
        let height = 100;
        if (node.type === 'actor') { width = 120; height = 160; }
        if (node.type === 'usecase') { width = 180; height = 100; }
        dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // 2. Aplicar posiciones iniciales
    let layoutedNodes = nodes.map((node) => {
        if (node.type === 'system') return node;
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - (nodeWithPosition.width / 2),
                y: nodeWithPosition.y - (nodeWithPosition.height / 2),
            },
        };
    });

    // 3. Ajustar el SISTEMA y empujar actores si es necesario
    systemNodes.forEach(sys => {
        const children = layoutedNodes.filter(n => n.parentId === sys.id);
        if (children.length > 0) {
            const minX = Math.min(...children.map(c => c.position.x));
            const minY = Math.min(...children.map(c => c.position.y));
            const maxX = Math.max(...children.map(c => c.position.x + 180));
            const maxY = Math.max(...children.map(c => c.position.y + 100));

            const padding = 100; // Más aire dentro del sistema
            sys.position = { x: minX - padding, y: minY - (padding + 40) };
            sys.style = { 
                width: (maxX - minX) + (padding * 2), 
                height: (maxY - minY) + (padding * 2) + 40,
                zIndex: -1 // Siempre detrás
            };

            // Asegurarse de que los actores no queden solapados con el rectángulo
            layoutedNodes = layoutedNodes.map(n => {
                if (n.type === 'actor' && n.position.x > sys.position.x - 200) {
                    return { ...n, position: { x: sys.position.x - 250, y: n.position.y } };
                }
                if (n.parentId === sys.id) {
                    return {
                        ...n,
                        position: { x: n.position.x - sys.position.x, y: n.position.y - sys.position.y }
                    };
                }
                return n;
            });
        }
    });

    return { nodes: layoutedNodes, edges };
};
