import React, { useState } from 'react';
import { 
    Database, Kanban, Sparkles, Trash2, Edit3, 
    Plus, FileJson, AlertCircle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useStagingAreaStore } from '../../store/useStagingAreaStore';
import { useProject } from '../../context/ProjectContext';
import { deployProjectToBackend } from '../../services/importService';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export const ProjectFactory = () => {
    const store = useStagingAreaStore();
    const { projectId } = useProject();
    const [activeTab, setActiveTab] = useState<'erd' | 'backlog'>('erd');
    const [jsonInput, setJsonInput] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);

    const handleFinalInjection = async () => {
        if (!projectId) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor, seleccioná un proyecto antes de inyectar.', background: '#18181b', color: '#fff' });
            return;
        }

        try {
            setIsDeploying(true);
            
            await deployProjectToBackend(projectId, store.stagedErd, store.stagedBacklog);

            Swal.fire({
                icon: 'success',
                title: '¡Despliegue Exitoso!',
                text: 'La arquitectura y el backlog han sido inyectados y consolidados.',
                background: '#18181b', color: '#fff', confirmButtonColor: '#10b981'
            });

            store.reset();
        } catch (error: any) {
            console.error("Error en la inyección:", error);
            Swal.fire({
                icon: 'error',
                title: 'Falla en el Despliegue',
                text: error.response?.data?.details || 'Error crítico en la transacción atómica.',
                background: '#18181b', color: '#fff'
            });
        } finally {
            setIsDeploying(false);
        }
    };

    const handleProcessJson = () => {
        const result = store.loadFromJson(activeTab, jsonInput);
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Inyección Exitosa!',
                text: `Se han procesado ${activeTab === 'erd' ? store.stagedErd.length : store.stagedBacklog.length} elementos correctamente.`,
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                background: '#18181b', color: '#fff'
            });
            setJsonInput('');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: result.error,
                background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
            });
        }
    };

    const handleEditTable = async (table: any) => {
        const { value: formValues } = await Swal.fire({
            title: '📝 Editar Tabla',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-4">
                    <input id="swal-name" class="swal2-input bg-zinc-950 text-white w-full m-0" value="${table.nombre}" placeholder="Nombre de la tabla">
                    <textarea id="swal-desc" class="swal2-textarea bg-zinc-950 text-white w-full m-0" placeholder="Descripción">${table.descripcion || ''}</textarea>
                </div>
            `,
            preConfirm: () => ({
                nombre: (document.getElementById('swal-name') as HTMLInputElement).value,
                descripcion: (document.getElementById('swal-desc') as HTMLTextAreaElement).value,
            })
        });

        if (formValues) {
            store.updateItem('erd', table.id, formValues);
        }
    };

    const handleEditTicket = async (ticket: any) => {
        const { value: formValues } = await Swal.fire({
            title: '🎫 Editar Ticket',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-4">
                    <input id="swal-title" class="swal2-input bg-zinc-950 text-white w-full m-0" value="${ticket.titulo}" placeholder="Título">
                    <select id="swal-type" class="swal2-input bg-zinc-950 text-white w-full m-0">
                        <option value="feature" ${ticket.tipo === 'feature' ? 'selected' : ''}>Feature</option>
                        <option value="bug" ${ticket.tipo === 'bug' ? 'selected' : ''}>Bug</option>
                        <option value="task" ${ticket.tipo === 'task' ? 'selected' : ''}>Task</option>
                    </select>
                </div>
            `,
            preConfirm: () => ({
                titulo: (document.getElementById('swal-title') as HTMLInputElement).value,
                tipo: (document.getElementById('swal-type') as HTMLSelectElement).value,
            })
        });

        if (formValues) {
            store.updateItem('backlog', ticket.id, formValues);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-10 space-y-10 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        La <span className="text-emerald-500 text-5xl">Fábrica</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mt-2 ml-1">Staging Area & Ensamblaje Modular</p>
                </div>
                <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
                    <button 
                        onClick={() => setActiveTab('erd')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'erd' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Database size={14} /> Base de Datos
                    </button>
                    <button 
                        onClick={() => setActiveTab('backlog')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'backlog' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Kanban size={14} /> Backlog Kanban
                    </button>
                </div>
            </header>

            {/* JSON Input Area */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileJson className="text-emerald-500" size={20} />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Inyección de Código JSON</h3>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium italic">Pega aquí el resultado de la IA para validarlo</span>
                </div>
                
                <textarea 
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={`[ { "nombre": "Usuarios", "columnas": [...] }, ... ]`}
                    className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500/30 transition-all resize-none custom-scrollbar"
                />

                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                            <Sparkles size={12} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Zod Validator Active</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleProcessJson}
                        className="px-10 py-4 bg-emerald-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all"
                    >
                        Analizar e Inyectar
                    </button>
                </div>
            </div>

            {/* Visual Editor (Staging Area) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        {activeTab === 'erd' ? <Database className="text-emerald-500" /> : <Kanban className="text-emerald-500" />}
                        Elementos en Aduana <span className="text-zinc-700 text-sm ml-2">({activeTab === 'erd' ? store.stagedErd.length : store.stagedBacklog.length})</span>
                    </h2>
                    <button 
                        onClick={() => {
                            if (activeTab === 'erd') store.addItem('erd', { nombre: 'Nueva Tabla', columnas: [] });
                            else store.addItem('backlog', { titulo: 'Nueva Tarea', tipo: 'task', prioridad: 'media' });
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <Plus size={14} /> Añadir {activeTab === 'erd' ? 'Tabla' : 'Ticket'} Manual
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'erd' ? (
                        store.stagedErd.map((table) => (
                            <div key={table.id} className="group bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all shadow-xl relative overflow-hidden">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleEditTable(table)} className="p-2 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 rounded-lg text-emerald-400"><Edit3 size={14} /></button>
                                    <button onClick={() => store.removeItem('erd', table.id!)} className="p-2 bg-zinc-800 hover:bg-red-900 rounded-lg text-red-500"><Trash2 size={14} /></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-emerald-500 border border-zinc-800">
                                            <Database size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{table.nombre}</h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">{table.columnas.length} Columnas</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 line-clamp-2 italic">"{table.descripcion || 'Sin descripción'}"</p>
                                    <div className="flex flex-wrap gap-1">
                                        {table.columnas.slice(0, 4).map((col, i) => (
                                            <span key={i} className="px-2 py-1 bg-zinc-950 text-[8px] font-black text-zinc-400 rounded-md border border-zinc-800">{col.nombre}: {col.tipo}</span>
                                        ))}
                                        {table.columnas.length > 4 && <span className="text-[8px] text-zinc-600 font-bold">+{table.columnas.length - 4} más</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        store.stagedBacklog.map((ticket) => (
                            <div key={ticket.id} className="group bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all shadow-xl relative">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleEditTicket(ticket)} className="p-2 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 rounded-lg text-emerald-400"><Edit3 size={14} /></button>
                                    <button onClick={() => store.removeItem('backlog', ticket.id!)} className="p-2 bg-zinc-800 hover:bg-red-900 rounded-lg text-red-500"><Trash2 size={14} /></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ticket.tipo === 'bug' ? 'bg-red-500/20 text-red-400' : ticket.tipo === 'feature' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {ticket.tipo}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ticket.prioridad === 'alta' || ticket.prioridad === 'critica' ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                            {ticket.prioridad}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-lg leading-tight">{ticket.titulo}</h3>
                                    <p className="text-xs text-zinc-500 line-clamp-2">{ticket.descripcion || 'Sin descripción detallada'}</p>
                                </div>
                            </div>
                        ))
                    )}

                    {(activeTab === 'erd' ? store.stagedErd : store.stagedBacklog).length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] space-y-4 opacity-50">
                            <Sparkles size={48} className="mx-auto text-zinc-800" />
                            <p className="text-zinc-600 font-bold italic">La Fábrica está esperando material para ensamblar...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Action Bar */}
            {(store.stagedErd.length > 0 || store.stagedBacklog.length > 0) && (
                <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 p-6 rounded-3xl shadow-2xl flex items-center gap-10 animate-in slide-in-from-bottom-10 duration-500 z-50">
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tablas Listas</span>
                            <span className="text-xl font-black text-white">{store.stagedErd.length}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tickets Listos</span>
                            <span className="text-xl font-black text-white">{store.stagedBacklog.length}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleFinalInjection}
                        disabled={isDeploying}
                        className="px-12 py-4 bg-emerald-500 text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isDeploying ? 'Desplegando...' : 'Consolidar e Inyectar en Proyecto'} <ChevronRight size={18} />
                    </button>
                </footer>
            )}

            <AnimatePresence>
                {isDeploying && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <div className="text-center space-y-6">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full mx-auto"
                            />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Sincronizando con PostgreSQL...</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Ejecutando Transacción Atómica</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
