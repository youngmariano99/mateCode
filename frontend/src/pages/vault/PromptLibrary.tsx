import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

interface Plantilla {
    id?: string;
    titulo: string;
    descripcion: string;
    contenidoPlantilla: string;
    faseObjetivo: string;
    etiquetasJson: string;
    inyectaAdn: boolean;
    inyectaStack: boolean;
    inyectaBdd: boolean;
    inyectaTicket: boolean;
}

export const PromptLibrary = () => {
    const { tenantId } = useProject();
    const [templates, setTemplates] = useState<Plantilla[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterFase, setFilterFase] = useState('');
    const [isEditing, setIsEditing] = useState<Plantilla | null>(null);

    const fetchTemplates = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const data = await api.get('/PromptLibrary', { params: { fase: filterFase || undefined } });
            setTemplates(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [filterFase]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload: Partial<Plantilla> = {
            titulo: formData.get('titulo') as string,
            descripcion: formData.get('descripcion') as string,
            contenidoPlantilla: formData.get('contenidoPlantilla') as string,
            faseObjetivo: formData.get('faseObjetivo') as string,
            inyectaAdn: formData.get('inyectaAdn') === 'on',
            inyectaStack: formData.get('inyectaStack') === 'on',
            inyectaBdd: formData.get('inyectaBdd') === 'on',
            inyectaTicket: formData.get('inyectaTicket') === 'on',
            etiquetasJson: JSON.stringify((formData.get('etiquetas') as string).split(',').map(s => s.trim()))
        };

        try {
            if (isEditing?.id) {
                await api.put(`/PromptLibrary/${isEditing.id}`, { ...payload, id: isEditing.id });
            } else {
                await api.post('/PromptLibrary', payload);
            }

            Swal.fire({ icon: 'success', title: 'Guardado', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#18181b', color: '#fff' });
            setIsEditing(null);
            fetchTemplates();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTemplate = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'Sí, borrar',
            background: '#18181b',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/PromptLibrary/${id}`);
                fetchTemplates();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Biblioteca de Prompts</h1>
                    <p className="text-zinc-500 text-sm">Gestioná las plantillas de IA para todo tu espacio de trabajo.</p>
                </div>
                <button 
                    onClick={() => setIsEditing({ titulo: '', descripcion: '', contenidoPlantilla: '', faseObjetivo: 'General', etiquetasJson: '[]', inyectaAdn: false, inyectaStack: false, inyectaBdd: false, inyectaTicket: false })}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg transition-all"
                >
                    + Nueva Plantilla
                </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                <div className="flex-1 flex gap-2">
                    {['', 'Fase 2', 'Kanban', 'General'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilterFase(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterFase === f ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-white'}`}
                        >
                            {f || 'Todos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de Plantillas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => (
                    <div key={t.id} className="group bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                            <button onClick={() => setIsEditing(t)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-emerald-400"><i className="fas fa-edit"></i></button>
                            <button onClick={() => deleteTemplate(t.id!)} className="p-2 bg-zinc-800 hover:bg-red-900 rounded-lg text-red-400"><i className="fas fa-trash"></i></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-zinc-800 text-[10px] font-black text-emerald-400 rounded uppercase">{t.faseObjetivo}</span>
                                <h3 className="font-bold text-lg">{t.titulo}</h3>
                            </div>
                            <p className="text-zinc-500 text-sm line-clamp-2">{t.descripcion}</p>
                            
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-900">
                                {t.inyectaAdn && <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[10px] rounded-full border border-purple-500/20">🧬 ADN</span>}
                                {t.inyectaBdd && <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] rounded-full border border-blue-500/20">📖 BDD</span>}
                                {t.inyectaTicket && <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-[10px] rounded-full border border-orange-500/20">🎫 Ticket</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Edición */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/50">
                            <h2 className="text-xl font-bold">{isEditing.id ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                            <button type="button" onClick={() => setIsEditing(null)} className="text-zinc-500 hover:text-white">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Título</label>
                                    <input name="titulo" defaultValue={isEditing.titulo} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fase Objetivo</label>
                                    <select name="faseObjetivo" defaultValue={isEditing.faseObjetivo} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm">
                                        <option value="Fase 2">Fase 2 (Diseño)</option>
                                        <option value="Kanban">Kanban (Fase 3)</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Descripción</label>
                                <input name="descripcion" defaultValue={isEditing.descripcion} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                    Contenido de la Plantilla
                                    <span className="block text-[10px] text-zinc-600 normal-case mt-1 font-medium italic">
                                        Usá etiquetas como {'{ADN_AQUI}'}, {'{BDD_AQUI}'} o {'{TICKET_ID}'} para la inyección de contexto.
                                    </span>
                                </label>
                                <textarea name="contenidoPlantilla" defaultValue={isEditing.contenidoPlantilla} required rows={10} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs leading-relaxed" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Inyección de Contexto</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { id: 'inyectaAdn', label: '🧬 ADN Project', color: 'purple' },
                                        { id: 'inyectaBdd', label: '📖 User Stories', color: 'blue' },
                                        { id: 'inyectaStack', label: '🛠 Tech Stack', color: 'emerald' },
                                        { id: 'inyectaTicket', label: '🎫 Data Ticket', color: 'orange' }
                                    ].map(sw => (
                                        <label key={sw.id} className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-900 transition-all shadow-sm">
                                            <input 
                                                type="checkbox" 
                                                name={sw.id} 
                                                defaultChecked={isEditing[sw.id as keyof Plantilla] as boolean} 
                                                className="w-4 h-4 rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-transparent"
                                            />
                                            <span className="text-[10px] font-bold uppercase">{sw.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-800/50 border-t border-zinc-800 flex justify-end gap-4">
                            <button type="button" onClick={() => setIsEditing(null)} className="px-6 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest">Cancelar</button>
                            <button type="submit" className="px-8 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl shadow-xl transition-all uppercase tracking-widest">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
