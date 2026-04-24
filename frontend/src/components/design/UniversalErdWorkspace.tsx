import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, type Node, type Edge, type OnNodesChange, type OnEdgesChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Code, Zap, Settings2, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';

import type { UniversalDatabaseSchema, TableDef, DatabaseEngine } from '../../services/design/DatabaseSchemaTypes';
import { UniversalTableNode } from './UniversalTableNode';
import { SqlGeneratorService } from '../../services/design/SqlGeneratorService';

const nodeTypes = {
    universalTable: UniversalTableNode
};

interface Props {
    initialCode: string;
    onCodeChange: (code: string) => void;
}

export const UniversalErdWorkspace = ({ initialCode, onCodeChange }: Props) => {
    const [schema, setSchema] = useState<UniversalDatabaseSchema>(() => {
        try {
            return JSON.parse(initialCode);
        } catch {
            return {
                project_name: 'Nuevo Proyecto ERD',
                default_engine: 'postgresql',
                tables: [],
                relationships: []
            };
        }
    });

    // Notificar cambios al padre para persistencia
    useEffect(() => {
        onCodeChange(JSON.stringify(schema, null, 2));
    }, [schema]);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedTable, setSelectedTable] = useState<TableDef | null>(null);

    // Sincronizar React Flow con el Schema JSON
    useEffect(() => {
        const flowNodes: Node[] = schema.tables.map(table => ({
            id: table.id,
            type: 'universalTable',
            position: table.position || { x: 100, y: 100 },
            data: { 
                label: table.name, 
                columns: table.columns,
                id: table.id,
                onEditColumn: (tid: string) => {
                    const t = schema.tables.find(xt => xt.id === tid);
                    if (t) setSelectedTable(t);
                }
            }
        }));

        const flowEdges: Edge[] = schema.relationships.map(rel => {
            // La IA a veces devuelve el nombre de la tabla en lugar del ID. 
            // Buscamos el ID real basado en el nombre si es necesario.
            const sourceId = schema.tables.find(t => t.id === rel.source_table || t.name === rel.source_table)?.id || rel.source_table;
            const targetId = schema.tables.find(t => t.id === rel.target_table || t.name === rel.target_table)?.id || rel.target_table;

            return {
                id: rel.id,
                source: sourceId,
                target: targetId,
                label: rel.type.replace('_', ' '),
                animated: true,
                style: { stroke: '#10b981', strokeWidth: 2 }
            };
        });

        setNodes(flowNodes);
        setEdges(flowEdges);
    }, [schema]);

    const onNodesChange: OnNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange: OnEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    // --- ACCIONES DEL SCHEMA ---

    const handleAutoLayout = () => {
        const columns = 3;
        const gapX = 450;
        const gapY = 500;

        setSchema(prev => ({
            ...prev,
            tables: prev.tables.map((table, index) => ({
                ...table,
                position: {
                    x: (index % columns) * gapX,
                    y: Math.floor(index / columns) * gapY
                }
            }))
        }));
    };

    const handleAddTable = () => {
        const newId = `table_${Date.now()}`;
        const newTable: TableDef = {
            id: newId,
            name: 'nueva_tabla',
            columns: [
                { name: 'id', data_family: 'uuid', is_primary_key: true }
            ],
            position: { x: Math.random() * 400, y: Math.random() * 400 }
        };

        setSchema(prev => ({
            ...prev,
            tables: [...prev.tables, newTable]
        }));
    };

    const handleImportJson = async () => {
        const { value: jsonStr } = await Swal.fire({
            title: '🚀 Importar Schema IA',
            input: 'textarea',
            inputPlaceholder: 'Pegá el JSON de la especificación UniversalDatabaseSchema aquí...',
            showCancelButton: true,
            background: '#18181b', color: '#fff'
        });

        if (jsonStr) {
            try {
                const parsed = JSON.parse(jsonStr);
                setSchema(parsed);
                Swal.fire({ icon: 'success', title: 'Schema Actualizado', background: '#18181b', color: '#fff' });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'JSON Inválido', background: '#18181b', color: '#fff' });
            }
        }
    };

    const handleExportSql = (engine: DatabaseEngine) => {
        const sql = SqlGeneratorService.generateDDL(schema, engine);
        Swal.fire({
            title: `SQL Export (${engine.toUpperCase()})`,
            html: `<pre style="text-align: left; font-size: 10px; background: #000; padding: 10px; color: #0f0; border-radius: 8px; max-height: 400px; overflow-y: auto;">${sql}</pre>`,
            width: '800px',
            background: '#18181b', color: '#fff'
        });
    };

    return (
        <div className="flex h-full bg-zinc-950 overflow-hidden">
            {/* Main Canvas Area */}
            <div className="flex-1 relative flex flex-col">
                {/* Canvas Toolbar */}
                <div className="absolute top-6 left-6 z-10 flex gap-2">
                    <button 
                        onClick={handleAddTable}
                        className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 p-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                        <Plus size={16} /> Agregar Tabla
                    </button>
                    <button 
                        onClick={handleAutoLayout}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 p-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
                        title="Auto-Acomodar"
                    >
                        <RefreshCcw size={16} />
                    </button>
                    <button 
                        onClick={handleImportJson}
                        className="bg-zinc-900 border border-zinc-800 text-emerald-400 p-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all"
                    >
                        <Zap size={16} /> Importar IA
                    </button>
                </div>

                <div className="absolute top-6 right-6 z-10 flex gap-2">
                    <button 
                        onClick={() => handleExportSql('postgresql')}
                        className="bg-zinc-900 border border-zinc-800 text-blue-400 p-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all"
                    >
                        <Code size={16} /> Exportar DDL
                    </button>
                </div>

                {/* React Flow Canvas */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                        colorMode="dark"
                    >
                        <Background color="#18181b" gap={30} size={1} />
                        <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-400" />
                    </ReactFlow>
                </div>
            </div>

            {/* Editing Sidebar */}
            {selectedTable && (
                <div className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
                        <div className="flex items-center gap-3">
                            <Settings2 className="text-emerald-500" size={20} />
                            <h3 className="font-black text-white uppercase text-xs tracking-widest">Editar Tabla</h3>
                        </div>
                        <button onClick={() => setSelectedTable(null)} className="text-zinc-500 hover:text-white">✕</button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Nombre de Tabla</label>
                            <input 
                                type="text"
                                value={selectedTable.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    setSchema(prev => ({
                                        ...prev,
                                        tables: prev.tables.map(t => t.id === selectedTable.id ? { ...t, name: newName } : t)
                                    }));
                                    setSelectedTable(prev => prev ? { ...prev, name: newName } : null);
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Columnas</label>
                                <button className="text-emerald-400 text-[10px] font-bold hover:underline">+ Agregar</button>
                            </div>
                            <div className="space-y-3">
                                {selectedTable.columns.map((col, idx) => (
                                    <div key={idx} className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white">{col.name}</span>
                                            <span className="text-[9px] text-zinc-500 font-mono">{col.data_family}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400">✏️</button>
                                            <button className="p-1.5 hover:bg-zinc-800 rounded text-red-400">🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-zinc-800 bg-zinc-950">
                         <button 
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all"
                            onClick={() => setSelectedTable(null)}
                         >
                            Listo
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};
