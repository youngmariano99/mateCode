import { Handle, Position } from '@xyflow/react';
import type { DataFamily, ColumnDef } from '../../services/design/DatabaseSchemaTypes';

const familyIcons: Record<DataFamily, string> = {
    integer: '🔢',
    decimal: '💵',
    string: '🔤',
    text: '📄',
    boolean: '⚖️',
    datetime: '📅',
    binary: '📦',
    json: '🧩',
    spatial: '🌐',
    uuid: '🔑',
    array: '📚',
    enum: '🎭',
    other: '⚙️'
};

export const UniversalTableNode = ({ data }: any) => {
    const columns: ColumnDef[] = data.columns || [];

    return (
        <div className="bg-zinc-900 border-2 border-zinc-700 rounded-2xl overflow-hidden shadow-2xl min-w-[260px] hover:border-emerald-500/50 transition-all duration-300">
            {/* Header */}
            <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20">
                        {data.label.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white tracking-tight uppercase">{data.label}</h4>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                            {data.schema || 'public'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Columns */}
            <div className="p-2 space-y-1">
                {columns.map((col, idx) => (
                    <div 
                        key={idx} 
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => data.onEditColumn?.(data.id, col)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xs grayscale group-hover:grayscale-0 transition-all">
                                {familyIcons[col.data_family] || '⚙️'}
                            </span>
                            <div className="flex flex-col">
                                <span className={`text-[11px] font-bold ${col.is_primary_key ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                    {col.name} {col.is_primary_key && '🔑'}
                                </span>
                            </div>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                            {col.native_type || col.data_family}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer / Connectors */}
            <div className="h-2 bg-zinc-800/50" />
            
            <Handle type="target" position={Position.Left} className="w-4 h-4 bg-zinc-900 border-2 border-emerald-500 rounded-full" />
            <Handle type="source" position={Position.Right} className="w-4 h-4 bg-zinc-900 border-2 border-blue-500 rounded-full" />
        </div>
    );
};
