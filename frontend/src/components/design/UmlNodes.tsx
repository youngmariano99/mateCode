import { Handle, Position, type NodeProps } from '@xyflow/react';
import { User } from 'lucide-react';

export const ActorNode = ({ data }: NodeProps) => (
    <div className="flex flex-col items-center gap-2 group">
        <Handle type="target" position={Position.Left} className="!bg-zinc-800" />
        <div className="w-16 h-16 bg-white border-2 border-zinc-800 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:border-blue-500 transition-all">
            <User size={32} className="text-zinc-800" />
        </div>
        <span className="text-[10px] font-black text-zinc-800 uppercase tracking-tighter bg-white px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
            {data.label as string}
        </span>
        <Handle type="source" position={Position.Right} className="!bg-zinc-800" />
    </div>
);

export const UseCaseNode = ({ data }: NodeProps) => (
    <div className="flex flex-col items-center justify-center group">
        <Handle type="target" position={Position.Left} className="!bg-zinc-800" />
        <div className="px-6 py-3 bg-white border-2 border-zinc-800 rounded-[50%] min-w-[140px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] group-hover:border-blue-500 group-hover:shadow-blue-500/10 transition-all">
            <span className="text-[11px] font-bold text-zinc-900 italic">{data.label as string}</span>
        </div>
        <Handle type="source" position={Position.Right} className="!bg-zinc-800" />
    </div>
);

export const SystemNode = ({ data, selected }: NodeProps) => (
    <div className={`w-full h-full bg-white/40 border-2 ${selected ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-zinc-800'} rounded-lg transition-all`}>
        <div className="absolute -top-6 left-0 px-3 py-1 bg-zinc-800 text-white rounded-t-md">
            <span className="text-[10px] font-black uppercase tracking-widest">{data.label as string}</span>
        </div>
    </div>
);

export const ParticipantNode = ({ data }: NodeProps) => (
    <div className="flex flex-col items-center group">
        <Handle type="target" position={Position.Left} className="!bg-zinc-800" />
        <div className="px-5 py-4 bg-zinc-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-2xl min-w-[180px] text-center mb-4 border-2 border-zinc-800 group-hover:bg-blue-600 group-hover:border-blue-400 transition-all">
            {data.label as string}
        </div>
        {/* Life line visual representation */}
        <div className="w-0.5 h-[600px] border-l-2 border-dashed border-zinc-300 group-hover:border-blue-300 transition-all" />
        <Handle type="source" position={Position.Right} className="!bg-zinc-800" />
    </div>
);
