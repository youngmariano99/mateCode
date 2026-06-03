import { useState, useEffect } from 'react';
import { Shield, Zap, Search, LayoutGrid, List } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

interface Plantilla {
    id?: string;
    titulo: string;
    descripcion: string;
    bloquePersona: string;
    bloqueTarea: string;
    tipoDiagrama: string;
    faseObjetivo: string;
    etiquetasJson: string;
    inyectaAdn: boolean;
    inyectaStack: boolean;
    inyectaBdd: boolean;
    inyectaTicket: boolean;
    inyectaBlueprint: boolean;
}

export const PromptLibrary = () => {
    const { tenantId } = useProject();
    const [templates, setTemplates] = useState<Plantilla[]>([]);
    const [filterFase, setFilterFase] = useState('');
    const [isEditing, setIsEditing] = useState<Plantilla | null>(null);

    const fetchTemplates = async () => {
        if (!tenantId) return;
        try {
            const data = await api.get('/PromptLibrary', { params: { fase: filterFase || undefined } });
            setTemplates(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [filterFase]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // Mapeamos los datos del formulario sobre el objeto actual para no perder campos técnicos (id, fechaCreacion, etc.)
        const payload = {
            ...(isEditing || {}),
            titulo: formData.get('titulo') as string,
            descripcion: formData.get('descripcion') as string,
            bloquePersona: formData.get('bloquePersona') as string,
            bloqueTarea: formData.get('bloqueTarea') as string,
            tipoDiagrama: formData.get('tipoDiagrama') as string,
            faseObjetivo: formData.get('faseObjetivo') as string,
            inyectaAdn: formData.get('inyectaAdn') === 'on',
            inyectaStack: formData.get('inyectaStack') === 'on',
            inyectaBdd: formData.get('inyectaBdd') === 'on',
            inyectaTicket: formData.get('inyectaTicket') === 'on',
            inyectaBlueprint: formData.get('inyectaBlueprint') === 'on',
            etiquetasJson: JSON.stringify((formData.get('etiquetas') as string || "").split(',').map(s => s.trim()))
        };

        try {
            if (isEditing?.id) {
                await api.put(`/PromptLibrary/${isEditing.id}`, payload);
            } else {
                await api.post('/PromptLibrary', payload);
            }

            Swal.fire({ icon: 'success', title: 'Guardado', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#18181b', color: '#fff' });
            setIsEditing(null);
            fetchTemplates();
        } catch (err) {
            console.error("Error al guardar plantilla:", err);
            Swal.fire({ icon: 'error', title: 'Error al guardar', text: 'Revisá los campos obligatorios.', background: '#18181b', color: '#fff' });
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
                    onClick={() => setIsEditing({ 
                        titulo: '', 
                        descripcion: '', 
                        bloquePersona: 'Actúa como un Arquitecto de Software Senior...', 
                        bloqueTarea: '',
                        tipoDiagrama: 'ERD',
                        faseObjetivo: 'Fase 2', 
                        etiquetasJson: '[]', 
                        inyectaAdn: false, 
                        inyectaStack: false, 
                        inyectaBdd: false, 
                        inyectaTicket: false,
                        inyectaBlueprint: false
                    })}
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

            {/* Grid de Plantillas de Diseño (Maestras) */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Diagramas de Arquitectura (Plantillas Maestras)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.filter(t => t.tipoDiagrama && t.tipoDiagrama !== 'General').map(t => (
                        <div key={t.id} className="group bg-zinc-900/40 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                <button onClick={() => setIsEditing(t)} title="Refinar" className="p-2 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 rounded-lg text-emerald-400 transition-all">✏️</button>
                                {/* Protegemos las maestras de ser borradas por accidente */}
                                <button disabled className="p-2 bg-zinc-900 rounded-lg text-zinc-700 cursor-not-allowed">🗑️</button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 text-xs font-bold">
                                        {t.tipoDiagrama?.[0]}
                                    </div>
                                    <h3 className="font-bold text-lg">{t.titulo}</h3>
                                </div>
                                <p className="text-zinc-500 text-xs line-clamp-2">{t.descripcion}</p>
                                
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800/50">
                                    {t.inyectaAdn && <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[9px] font-bold rounded-full border border-purple-500/20 uppercase tracking-tighter">🧬 ADN</span>}
                                    {t.inyectaBdd && <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded-full border border-blue-500/20 uppercase tracking-tighter">📖 BDD</span>}
                                    {t.inyectaStack && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-tighter">🛠 Stack</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-zinc-900 w-full" />

            {/* Grid de Plantillas Generales */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Prompts Generales y Personalizados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.filter(t => !t.tipoDiagrama || t.tipoDiagrama === 'General').map(t => (
                        <div key={t.id} className="group bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                <button onClick={() => setIsEditing(t)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400">✏️</button>
                                <button onClick={() => deleteTemplate(t.id!)} className="p-2 bg-zinc-800 hover:bg-red-900 rounded-lg text-red-400">🗑️</button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-zinc-800 text-[10px] font-black text-zinc-500 rounded uppercase">{t.faseObjetivo}</span>
                                    <h3 className="font-bold text-lg">{t.titulo}</h3>
                                </div>
                                <p className="text-zinc-500 text-sm line-clamp-2">{t.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Edición */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{isEditing.id ? 'Refinar Plantilla' : 'Nueva Estructura AI'}</h2>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Configuración Modular de Oráculo</p>
                            </div>
                            <button type="button" onClick={() => setIsEditing(null)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all text-xl">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-10 space-y-10">
                            {/* Información Básica */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre de la Plantilla</label>
                                        <input name="titulo" defaultValue={isEditing.titulo} required className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-white shadow-inner" placeholder="Ej: Generador de Esquema Relacional Pro" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tipo de Diagrama (Locked Format)</label>
                                        <select name="tipoDiagrama" defaultValue={isEditing.tipoDiagrama} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-bold text-emerald-500">
                                            <option value="ERD">ERD (Base de Datos)</option>
                                            <option value="SITEMAP">SITEMAP (Arquitectura)</option>
                                            <option value="UML">UML (Secuencia/PlantUML)</option>
                                            <option value="ROLES">ROLES (Matriz de Seguridad)</option>
                                            <option value="General">General (Libre)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descripción Breve</label>
                                    <textarea name="descripcion" defaultValue={isEditing.descripcion} rows={2} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm text-zinc-400 resize-none" placeholder="Para qué sirve esta plantilla..." />
                                </div>
                            </div>

                            {/* BLOQUES MODULARES */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Bloque 1: Persona */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">🎭</div>
                                        <label className="text-[10px] font-black text-white uppercase tracking-widest">Identidad (Persona)</label>
                                    </div>
                                    <textarea name="bloquePersona" defaultValue={isEditing.bloquePersona} required rows={6} className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-sm leading-relaxed text-zinc-300 shadow-inner" placeholder="Actúa como un..." />
                                </div>

                                {/* Bloque 2: Tarea */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">🎯</div>
                                        <label className="text-[10px] font-black text-white uppercase tracking-widest">Misión (Tarea)</label>
                                    </div>
                                    <textarea name="bloqueTarea" defaultValue={isEditing.bloqueTarea} required rows={6} className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm leading-relaxed text-zinc-300 shadow-inner" placeholder="Tu tarea es analizar el contexto y..." />
                                </div>
                            </div>

                            {/* Inyección de Contexto (Switches) */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Configuración de Contexto por Defecto</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { id: 'inyectaAdn', label: '🧬 ADN', color: 'purple' },
                                        { id: 'inyectaStack', label: '🛠 Stack', color: 'emerald' },
                                        { id: 'inyectaBdd', label: '📖 Stories', color: 'blue' },
                                        { id: 'inyectaBlueprint', label: '📜 Blueprint', color: 'cyan' },
                                        { id: 'inyectaTicket', label: '🎫 Ticket', color: 'orange' }
                                    ].map(sw => (
                                        <label key={sw.id} className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-all group">
                                            <input 
                                                type="checkbox" 
                                                name={sw.id} 
                                                defaultChecked={isEditing[sw.id as keyof Plantilla] as boolean} 
                                                className="w-5 h-5 rounded-lg border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-transparent"
                                            />
                                            <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-white transition-colors">{sw.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Información Técnica */}
                            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-800">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fase del Ciclo de Vida</label>
                                    <select name="faseObjetivo" defaultValue={isEditing.faseObjetivo} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 outline-none text-xs font-bold">
                                        <option value="Fase 2">Fase 2 (Diseño)</option>
                                        <option value="Kanban">Fase 3 (Construcción)</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Etiquetas (Separadas por coma)</label>
                                    <input name="etiquetas" defaultValue={JSON.parse(isEditing.etiquetasJson || '[]').join(', ')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 outline-none text-xs font-bold" placeholder="IA, Diseño, ERD..." />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-6">
                            <button type="button" onClick={() => setIsEditing(null)} className="px-8 py-3 text-xs font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest">Descartar</button>
                            <button type="submit" className="px-12 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest shadow-emerald-500/20">Sincronizar Plantilla</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
