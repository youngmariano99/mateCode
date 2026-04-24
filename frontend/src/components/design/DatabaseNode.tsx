import { Handle, Position } from '@xyflow/react';
import { Database, Key, Link } from 'lucide-react';

export const DatabaseNode = ({ data }: any) => {
    return (
        <div className="bg-zinc-900 border-2 border-zinc-700 rounded-xl overflow-hidden shadow-2xl min-w-[240px] animate-in zoom-in-95 duration-200">
            {/* Table Header */}
            <div className="bg-zinc-800 p-3 border-b border-zinc-700 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Database size={16} className="text-blue-400" />
                </div>
                <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">{data.label}</h4>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase">PostgreSQL Table</p>
                </div>
            </div>

            {/* Columns List */}
            <div className="p-2 space-y-1 bg-zinc-900/50">
                {data.columns?.map((col: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
                        <div className="flex items-center gap-2">
                            {col.isPk ? (
                                <Key size={10} className="text-amber-400" />
                            ) : col.isFk ? (
                                <Link size={10} className="text-blue-400" />
                            ) : (
                                <div className="w-2.5" />
                            )}
                            <span className={`text-[10px] font-bold ${col.isPk ? 'text-amber-100' : 'text-zinc-300'}`}>
                                {col.name}
                            </span>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                            {col.type}
                        </span>
                    </div>
                ))}
            </div>

            {/* Connectors */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-zinc-900" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500 border-2 border-zinc-900" />
        </div>
    );
};
