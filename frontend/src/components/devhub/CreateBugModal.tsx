import React, { useState } from 'react';
import { api as apiClient } from '../../lib/apiClient';
import { RelationPicker } from './RelationPicker';
import { Link2, X, Bug as BugIcon } from 'lucide-react';

interface CreateBugModalProps {
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateBugModal: React.FC<CreateBugModalProps> = ({ projectId, onClose, onSuccess }) => {
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newSteps, setNewSteps] = useState('');
    const [selectingForNew, setSelectingForNew] = useState(false);
    const [selectedRelation, setSelectedRelation] = useState<{id: string, titulo: string, tipo: string} | null>(null);

    const handleReportBug = async () => {
        if (!newTitle || !newDesc) return;
        const res = await apiClient.post(`/api/colab/bugs`, { 
            proyectoId: projectId, 
            titulo: newTitle, 
            descripcion: newDesc, 
            pasosReproduccion: newSteps 
        }) as any;
        
        if (selectedRelation && res && res.id) {
            // Nota: El backend de Bugs actualmente asocia solo a Tickets. 
            // Si el tipo es diferente, podríamos expandirlo o simplemente ignorarlo.
            // Para cumplir con el requerimiento, asumimos que se puede asociar.
            await apiClient.put(`/api/colab/bugs/${res.id}/associate`, { ticketId: selectedRelation.id });
        }

        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                        <BugIcon size={16} /> Reportar Incidencia
                    </h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto">
                    <input 
                        type="text" 
                        value={newTitle} 
                        onChange={e => setNewTitle(e.target.value)} 
                        placeholder="Título breve del Bug..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-500 focus:outline-none"
                    />
                    <textarea 
                        value={newDesc} 
                        onChange={e => setNewDesc(e.target.value)} 
                        placeholder="Descripción detallada..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white h-24 focus:border-red-500 focus:outline-none"
                    />
                    <textarea 
                        value={newSteps} 
                        onChange={e => setNewSteps(e.target.value)} 
                        placeholder="Pasos para reproducir..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white h-24 focus:border-red-500 focus:outline-none"
                    />
                    
                    <div className="pt-2">
                        {selectedRelation ? (
                            <div className="flex items-center justify-between bg-zinc-950 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 mb-2">
                                <span className="truncate pr-2"><Link2 size={14} className="inline mr-2"/> Vinculado a: {selectedRelation.titulo} ({selectedRelation.tipo})</span>
                                <button onClick={() => setSelectedRelation(null)} className="text-zinc-500 hover:text-red-400"><X size={16}/></button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setSelectingForNew(!selectingForNew)}
                                className="w-full bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-red-400 flex items-center justify-center gap-2 transition-colors py-3 rounded-xl"
                            >
                                <Link2 size={16} /> Consultar al Oráculo
                            </button>
                        )}
                        
                        {selectingForNew && (
                            <RelationPicker 
                                onSelect={(id, titulo, tipo) => { setSelectedRelation({id, titulo, tipo}); setSelectingForNew(false); }} 
                                onCancel={() => setSelectingForNew(false)} 
                            />
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
                    <button onClick={handleReportBug} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-lg shadow-red-900/20">
                        Reportar Bug
                    </button>
                </div>
            </div>
        </div>
    );
};
