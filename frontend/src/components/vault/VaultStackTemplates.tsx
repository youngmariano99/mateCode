import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiClient';
import { useProject } from '../../context/ProjectContext';
import Swal from 'sweetalert2';
import { 
    Trash2, Plus, Layers, Edit3, Cpu, Search
} from 'lucide-react';

interface Tech {
    id: string;
    nombre: string;
    categoriaPrincipal: string;
}

interface Template {
    id: string;
    nombre: string;
    descripcion?: string;
    tecnologiasIdsJson: any;
}

export const VaultStackTemplates: React.FC = () => {
    const { tenantId } = useProject();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [catalog, setCatalog] = useState<Tech[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!tenantId) return;
        try {
            setLoading(true);
            const [catData, tempsData] = await Promise.all([
                api.get('/Stack/catalog'),
                api.get('/Stack/templates')
            ]);
            setCatalog(catData);
            setTemplates(tempsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantId]);

    const handleCreateTemplate = async () => {
        const { value: v } = await Swal.fire({
            title: '🛠️ Crear Nueva Arquitectura',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-6">
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Nombre de la Plantilla</label>
                        <input id="swal-temp-name" class="swal2-input bg-zinc-950 text-white w-full m-0" placeholder="Ej: Fullstack Next.js + NestJS">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Descripción (Opcional)</label>
                        <textarea id="swal-temp-desc" class="swal2-textarea bg-zinc-950 text-white w-full m-0 h-20" placeholder="Breve descripción del stack..."></textarea>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Componentes Tecnológicos</label>
                        <div class="max-h-48 overflow-y-auto bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 custom-scrollbar">
                            ${catalog.map(t => `
                                <label class="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors">
                                    <input type="checkbox" value="${t.id}" class="temp-tech-check w-4 h-4 rounded border-zinc-800 text-emerald-500">
                                    <span class="text-2xl">${t.categoriaPrincipal?.split(' ')[0]}</span>
                                    <span class="text-xs font-bold uppercase tracking-tighter text-zinc-400">${t.nombre}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `,
            preConfirm: () => {
                const selected = Array.from(document.querySelectorAll('.temp-tech-check:checked')).map((el: any) => el.value);
                return {
                    nombre: (document.getElementById('swal-temp-name') as HTMLInputElement).value,
                    descripcion: (document.getElementById('swal-temp-desc') as HTMLTextAreaElement).value,
                    tecnologiasIdsJson: selected
                };
            }
        });

        if (v && v.nombre) {
            try {
                await api.post('/Stack/templates', v);
                Swal.fire({ icon: 'success', title: 'Arquitectura Guardada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleEditTemplate = async (template: Template) => {
        let techIds: string[] = [];
        try {
            techIds = Array.isArray(template.tecnologiasIdsJson) 
                ? template.tecnologiasIdsJson 
                : JSON.parse(template.tecnologiasIdsJson);
        } catch(e) {}

        const { value: v } = await Swal.fire({
            title: '🛠️ Editar Arquitectura',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-6">
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Nombre de la Plantilla</label>
                        <input id="swal-temp-name" class="swal2-input bg-zinc-950 text-white w-full m-0" value="${template.nombre}">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Componentes Tecnológicos</label>
                        <div class="max-h-48 overflow-y-auto bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 custom-scrollbar">
                            ${catalog.map(t => `
                                <label class="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors">
                                    <input type="checkbox" value="${t.id}" class="temp-tech-check w-4 h-4 rounded border-zinc-800 text-emerald-500" ${techIds.includes(t.id) ? 'checked' : ''}>
                                    <span class="text-2xl">${t.categoriaPrincipal?.split(' ')[0]}</span>
                                    <span class="text-xs font-bold uppercase tracking-tighter text-zinc-400">${t.nombre}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `,
            preConfirm: () => {
                const selected = Array.from(document.querySelectorAll('.temp-tech-check:checked')).map((el: any) => el.value);
                return {
                    nombre: (document.getElementById('swal-temp-name') as HTMLInputElement).value,
                    tecnologiasIdsJson: selected
                };
            }
        });

        if (v && v.nombre) {
            try {
                await api.put(`/Stack/templates/${template.id}`, { ...template, ...v });
                Swal.fire({ icon: 'success', title: 'Arquitectura Actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDeleteTemplate = async (id: string, nombre: string) => {
        const result = await Swal.fire({
            title: `¿Eliminar arquitectura ${nombre}?`,
            text: "Esta plantilla desaparecerá de tu Bóveda permanente.",
            icon: 'warning',
            showCancelButton: true,
            background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/Stack/templates/${id}`);
                Swal.fire({ icon: 'success', title: 'Plantilla removida' });
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-zinc-500 font-black uppercase tracking-widest">Cargando Arquitecturas...</div>;

    return (
        <div className="space-y-8 p-8">
            <div className="flex justify-between items-center bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gestioná tus estructuras de stack predefinidas</p>
                <button 
                    onClick={handleCreateTemplate}
                    className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                >
                    <Plus size={18} /> Nueva Arquitectura
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => {
                    let techIds: string[] = [];
                    try {
                        techIds = Array.isArray(template.tecnologiasIdsJson) 
                            ? template.tecnologiasIdsJson 
                            : JSON.parse(template.tecnologiasIdsJson);
                    } catch(e) {}

                    return (
                        <div key={template.id} className="group p-8 bg-black/40 rounded-[2.5rem] border-2 border-white/5 shadow-sm hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between h-[300px] relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform">
                                <Layers size={120} className="text-emerald-500" />
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-500">
                                        <Cpu className="h-6 w-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleEditTemplate(template)}
                                            className="p-3 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-xl transition-all">
                                            <Edit3 size={20} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTemplate(template.id, template.nombre)}
                                            className="p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-black text-white text-xl italic uppercase tracking-tighter">{template.nombre}</h3>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {techIds.slice(0, 4).map(tid => {
                                        const t = catalog.find(x => x.id === tid);
                                        return t ? (
                                            <span key={tid} className="px-3 py-1 bg-white/5 text-[9px] font-black uppercase text-zinc-500 rounded-md border border-white/5">
                                                {t.nombre}
                                            </span>
                                        ) : null;
                                    })}
                                    {techIds.length > 4 && <span className="text-[9px] text-zinc-500 italic">+{techIds.length - 4} más</span>}
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{techIds.length} Componentes</span>
                                <span className="px-4 py-1.5 bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-600 rounded-full">Arquitectura Base</span>
                            </div>
                        </div>
                    );
                })}

                {templates.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <Layers className="mx-auto text-zinc-800 mb-4" size={50} />
                        <p className="text-zinc-500 font-bold italic">No hay arquitecturas guardadas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
