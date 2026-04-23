import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { 
    Trash2, ShieldCheck, Cpu, Plus, Layers, Search, 
    Settings2, Edit3, ExternalLink, Filter, Database, 
    Globe, Server, Smartphone, PenTool, Layout, X 
} from 'lucide-react';


// Tipos compartidos
interface Tech {
    id: string;
    nombre: string;
    categoriaPrincipal: string;
    categoriaSecundaria: string;
    urlDocumentacion?: string;
    colorHex?: string;
}

interface Template {
    id: string;
    nombre: string;
    descripcion?: string;
    tecnologiasIdsJson: any;
}

export default function Vault() {
    const { tenantId } = useProject();
    const [activeTab, setActiveTab] = useState<'templates' | 'catalog'>('templates');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [catalog, setCatalog] = useState<Tech[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const mainCategories = [
        '🖥️ Frontend', '⚙️ Backend', '🗄️ Base de Datos', 
        '☁️ Infra & DevOps', '🧪 Testing & QA', '📱 Mobile', '🎨 Diseño & UI'
    ];

    const secondaryCategories = [
        'Lenguaje', 'Framework', 'Librería', 'Motor DB', 'Extensión / ORM', 'Plataforma / Herramienta'
    ];

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
            console.error('Error fetching vault data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantId]);

    // --- GESTIÓN DE TECNOLOGÍAS ---

    const handleCreateOrEditTech = async (tech?: Tech) => {
        const { value: v } = await Swal.fire({
            title: tech ? '📝 Editar Tecnología' : '🚀 Nueva Tecnología',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Nombre de la Herramienta</label>
                        <input id="swal-name" class="swal2-input bg-zinc-950 text-white w-full m-0" value="${tech?.nombre || ''}" placeholder="Ej: React, PostgreSQL...">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                             <label class="text-[10px] font-black uppercase text-zinc-500">Capa (Principal)</label>
                             <select id="swal-main" class="swal2-input bg-zinc-950 text-white w-full m-0">
                                ${mainCategories.map(c => `<option value="${c}" ${tech?.categoriaPrincipal === c ? 'selected' : ''}>${c}</option>`).join('')}
                             </select>
                        </div>
                        <div class="space-y-1">
                             <label class="text-[10px] font-black uppercase text-zinc-500">Tipo (Secundario)</label>
                             <select id="swal-sec" class="swal2-input bg-zinc-950 text-white w-full m-0">
                                ${secondaryCategories.map(c => `<option value="${c}" ${tech?.categoriaSecundaria === c ? 'selected' : ''}>${c}</option>`).join('')}
                             </select>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">URL Documentación</label>
                        <input id="swal-url" class="swal2-input bg-zinc-950 text-white w-full m-0" value="${tech?.urlDocumentacion || ''}" placeholder="https://docs.example.com">
                    </div>
                </div>
            `,
            preConfirm: () => ({
                nombre: (document.getElementById('swal-name') as HTMLInputElement).value,
                categoriaPrincipal: (document.getElementById('swal-main') as HTMLSelectElement).value,
                categoriaSecundaria: (document.getElementById('swal-sec') as HTMLSelectElement).value,
                urlDocumentacion: (document.getElementById('swal-url') as HTMLInputElement).value
            })
        });

        if (v && v.nombre) {
            try {
                if (tech) {
                    await api.put(`/Stack/catalog/${tech.id}`, { ...tech, ...v });
                } else {
                    await api.post('/Stack/catalog', v);
                }
                Swal.fire({ icon: 'success', title: tech ? 'Actualizado' : 'Creado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDeleteTech = async (id: string, nombre: string) => {
        const result = await Swal.fire({
            title: `¿Eliminar ${nombre}?`,
            text: "Esta acción quitará la tecnología del catálogo global.",
            icon: 'warning',
            showCancelButton: true,
            background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/Stack/catalog/${id}`);
                Swal.fire({ icon: 'success', title: 'Eliminado' });
                fetchData();
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Ups', text: 'No se pudo eliminar' });
            }
        }
    };

    // --- GESTIÓN DE PLANTILLAS ---

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

    const filteredCatalog = catalog.filter(t => 
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoriaPrincipal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoriaSecundaria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* HEADER MASTER */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl text-emerald-500">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">La <span className="text-emerald-500">Bóveda</span></h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">GestiónMaestra de Activos y Conocimiento</p>
                    </div>
                </div>

                <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
                    <button 
                        onClick={() => setActiveTab('templates')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'templates' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Layers size={16} /> Plantillas de Stack
                    </button>
                    <button 
                        onClick={() => setActiveTab('catalog')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Database size={16} /> Catálogo Técnico
                    </button>
                </div>
            </header>

            {/* BUSCADOR Y ACCIONES RÁPIDAS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/10 p-6 rounded-[2.5rem] border border-zinc-900/20">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Filtrar activos..."
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-emerald-500/30 transition-all"
                    />
                </div>
                {activeTab === 'catalog' && (
                    <button 
                        onClick={() => handleCreateOrEditTech()}
                        className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                    >
                        <Plus size={18} /> Añadir Tecnología
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-32 text-center">
                    <div className="animate-spin inline-block w-10 h-10 border-4 border-current border-t-transparent text-emerald-500 rounded-full mb-4" />
                    <p className="text-zinc-500 font-bold italic animate-pulse">Sincronizando con los servidores de MateCode...</p>
                </div>
            ) : (
                <>
                    {/* VISTA DE PLANTILLAS */}
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {templates.map((template) => {
                                // Mapeo de tecnologías para preview
                                let techIds: string[] = [];
                                try {
                                    techIds = Array.isArray(template.tecnologiasIdsJson) 
                                        ? template.tecnologiasIdsJson 
                                        : JSON.parse(template.tecnologiasIdsJson);
                                } catch(e) {}

                                return (
                                    <div key={template.id} className="group p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between h-[300px] relative overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform">
                                            <Layers size={120} className="text-emerald-500" />
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                                    <Cpu className="h-6 w-6 text-emerald-500" />
                                                </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleEditTemplate(template)}
                                                    className="p-3 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-xl transition-all">
                                                    <Edit3 size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTemplate(template.id, template.nombre)}
                                                    className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            </div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xl italic uppercase tracking-tighter">{template.nombre}</h3>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {techIds.slice(0, 4).map(tid => {
                                                    const t = catalog.find(x => x.id === tid);
                                                    return t ? (
                                                        <span key={tid} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black uppercase text-zinc-500 rounded-md border border-zinc-200 dark:border-zinc-700">
                                                            {t.nombre}
                                                        </span>
                                                    ) : null;
                                                })}
                                                {techIds.length > 4 && <span className="text-[9px] text-zinc-500 italic">+{techIds.length - 4} más</span>}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center relative z-10">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{techIds.length} Componentes</span>
                                            <span className="px-4 py-1.5 bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-600 rounded-full">Prototipo Listo</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {templates.length === 0 && (
                                <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-[3rem]">
                                    <Layers className="mx-auto text-zinc-300 dark:text-zinc-800 mb-4" size={50} />
                                    <p className="text-zinc-500 font-bold italic">No hay plantillas guardadas en este tenant.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VISTA DE CATÁLOGO (FILAS Y COLUMNAS) */}
                    {activeTab === 'catalog' && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Emoji</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nombre</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Capa Arquitectónica</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Naturaleza / Tipo</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {filteredCatalog.map(t => (
                                            <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-all group">
                                                <td className="px-8 py-6 text-2xl grayscale group-hover:grayscale-0 transition-all">
                                                    {t.categoriaPrincipal?.split(' ')[0] || '🛠️'}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900 dark:text-white text-lg italic uppercase tracking-tighter">{t.nombre}</span>
                                                        {t.urlDocumentacion && (
                                                            <a href={t.urlDocumentacion} target="_blank" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                                                Docs <ExternalLink size={10} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-4 py-1 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-zinc-500 rounded-full border border-zinc-200 dark:border-zinc-700">
                                                        {t.categoriaPrincipal}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-4 py-1 bg-emerald-500/5 text-[10px] font-black uppercase text-emerald-600 rounded-full border border-emerald-500/10">
                                                        {t.categoriaSecundaria}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button 
                                                            onClick={() => handleCreateOrEditTech(t)}
                                                            className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTech(t.id, t.nombre)}
                                                            className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredCatalog.length === 0 && (
                                <div className="py-24 text-center">
                                    <p className="text-zinc-500 font-bold italic">No se encontraron herramientas en el glosario.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ACCESOS DIRECTOS A OTRAS BÓVEDAS */}
            <div className="flex flex-wrap gap-4 pt-10 border-t border-zinc-200 dark:border-zinc-900">
                <a href="/app/vault/prompts" className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-xs font-black uppercase hover:bg-zinc-800 transition-all flex items-center gap-3">
                    📜 Biblioteca de Prompts
                </a>
                <a href="/app/vault/forms" className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-xs font-black uppercase hover:bg-zinc-800 transition-all flex items-center gap-3">
                    📝 Biblioteca de Formularios
                </a>
                <a href="/app/vault/standards" className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-black uppercase hover:bg-emerald-500/20 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    🛡️ Estándares Blueprint
                </a>
            </div>
        </div>
    );
}
