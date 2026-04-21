import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Trash2, Save, ExternalLink, Cpu, Info, CheckCircle2, Settings2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

interface Tech {
    id: string;
    nombre: string;
    categoriaPrincipal: string; // La "Capa"
    categoriaSecundaria: string; // El "Tipo"
    urlDocumentacion?: string;
    colorHex?: string;
}

interface Template {
    id: string;
    nombre: string;
    descripcion?: string;
    tecnologiasIdsJson: string[];
}

export const StackBuilder = ({ projectId, tenantId }: { projectId: string, tenantId: string }) => {
    const [catalog, setCatalog] = useState<Tech[]>([]);
    const [projectStack, setProjectStack] = useState<Tech[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [showCatalogManager, setShowCatalogManager] = useState(false);

    const mainCategories = [
        '🖥️ Frontend', 
        '⚙️ Backend', 
        '🗄️ Base de Datos', 
        '☁️ Infra & DevOps', 
        '🧪 Testing & QA', 
        '📱 Mobile', 
        '🎨 Diseño & UI'
    ];

    const secondaryCategories = [
        'Lenguaje', 
        'Framework', 
        'Librería', 
        'Motor DB', 
        'Extensión / ORM', 
        'Plataforma / Herramienta'
    ];

    const loadData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId };
            
            const [resCat, resStack, resTemps] = await Promise.all([
                fetch(`${API_BASE}/api/Stack/catalog`, { headers }),
                fetch(`${API_BASE}/api/Stack/project/${projectId}`, { headers }),
                fetch(`${API_BASE}/api/Stack/templates`, { headers })
            ]);

            if (resCat.ok) setCatalog(await resCat.json());
            if (resTemps.ok) setTemplates(await resTemps.json());
            if (resStack.ok) {
                const stackData = await resStack.json();
                setProjectStack(stackData.map((s: any) => s.tecnologia));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [projectId, tenantId]);

    const handleAddTech = async (techId: string) => {
        if (projectStack.some(t => t.id === techId)) return;
        const tech = catalog.find(t => t.id === techId);
        if (!tech) return;

        const newStack = [...projectStack, tech];
        setProjectStack(newStack);
        syncStack(newStack);
        setSearch('');
    };

    const handleRemoveTech = (techId: string) => {
        const newStack = projectStack.filter(t => t.id !== techId);
        setProjectStack(newStack);
        syncStack(newStack);
    };

    const syncStack = async (newStack: Tech[]) => {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`${API_BASE}/api/Stack/project/${projectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify(newStack.map(t => t.id))
        });
    };

    const createOnTheFly = async () => {
        const { value: v } = await Swal.fire({
            title: '🚀 Nueva Tecnología',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-4">
                    <input id="swal-name" class="swal2-input bg-zinc-950 text-white w-full m-0" placeholder="Nombre (Ej: NestJS)">
                    <select id="swal-main" class="swal2-input bg-zinc-950 text-white w-full m-0">
                        ${mainCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="swal-sec" class="swal2-input bg-zinc-950 text-white w-full m-0">
                        ${secondaryCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <input id="swal-url" class="swal2-input bg-zinc-950 text-white w-full m-0" placeholder="URL Documentación">
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
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE}/api/Stack/catalog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId },
                body: JSON.stringify(v)
            });
            if (res.ok) {
                const newTech = await res.json();
                setCatalog(prev => [...prev, newTech]);
                handleAddTech(newTech.id);
            }
        }
    };

    const handleSaveVault = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const techIds = projectStack.map(t => t.id);

        if (activeTemplateId) {
            const { isConfirmed } = await Swal.fire({
                title: '¿Actualizar Plantilla?',
                text: "Se sobreescribirá la plantilla de la bóveda con los cambios actuales.",
                icon: 'question',
                showCancelButton: true,
                background: '#18181b', color: '#fff', confirmButtonColor: '#10b981'
            });

            if (isConfirmed) {
                const temp = templates.find(t => t.id === activeTemplateId);
                await fetch(`${API_BASE}/api/Stack/templates/${activeTemplateId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId },
                    body: JSON.stringify({ ...temp, tecnologiasIdsJson: techIds })
                });
                Swal.fire({ icon: 'success', title: 'Plantilla Actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                loadData(); // Refrescar lista de plantillas
                return;
            }
        }

        const { value: name } = await Swal.fire({
            title: '💾 Nueva Plantilla en Bóveda',
            input: 'text',
            inputLabel: 'Nombre de la arquitectura',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981'
        });

        if (name) {
            const res = await fetch(`${API_BASE}/api/Stack/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}`, 'X-Tenant-Id': tenantId },
                body: JSON.stringify({ Nombre: name, tecnologiasIdsJson: techIds })
            });
            if (res.ok) {
                const newTemp = await res.json();
                setTemplates(prev => [...prev, newTemp]);
                setActiveTemplateId(newTemp.id);
                Swal.fire({ icon: 'success', title: 'Guardado en La Bóveda', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            }
        }
    };

    const loadTemplate = async (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        
        // Buscamos las tecnologías en el catálogo local
        const techs = catalog.filter(t => template.tecnologiasIdsJson.includes(t.id));
        setProjectStack(techs);
        syncStack(techs);
        setActiveTemplateId(templateId);
        
        Swal.fire({ icon: 'info', title: 'Plantilla Cargada', text: template.nombre, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    };

    if (loading) return <div className="h-96 bg-zinc-950 animate-pulse rounded-[3rem]" />;

    return (
        <section className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* COCKPIT PRINCIPAL */}
            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-3xl text-emerald-500">
                            <Layers size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Designer Stack <span className="text-emerald-500">Master</span></h2>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Cockpit de Ingeniería y Arquitectura</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowCatalogManager(!showCatalogManager)}
                            className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-xl transition-all"
                            title="Gestionar Catálogo de Tecnologías"
                        >
                            <Settings2 size={20} />
                        </button>
                        {activeTemplateId && (
                            <span className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-black uppercase rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-emerald-500" /> Sincronizado
                            </span>
                        )}
                        <button onClick={handleSaveVault} className="px-6 py-3 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase flex items-center gap-2 group/btn">
                             <Save size={16} className="group-hover/btn:scale-110 transition-transform" /> {activeTemplateId ? 'Actualizar Bóveda' : 'Guardar en Bóveda'}
                        </button>
                    </div>
                </div>

                {/* BUSCADOR TAXONÓMICO */}
                <div className="relative z-50">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, capa o tipo (Ej: PostgreSQL Motor DB)" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 pl-16 text-sm text-zinc-300 outline-none focus:border-emerald-500/30 transition-all font-medium"
                    />
                    {search && (
                        <div className="absolute top-full left-0 w-full bg-zinc-950 border-2 border-zinc-800 rounded-[2.5rem] mt-3 p-4 shadow-2xl max-h-[400px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2">
                            {catalog.filter(t => 
                                (
                                    (t.nombre?.toLowerCase() ?? "").includes(search.toLowerCase()) || 
                                    (t.categoriaPrincipal?.toLowerCase() ?? "").includes(search.toLowerCase()) || 
                                    (t.categoriaSecundaria?.toLowerCase() ?? "").includes(search.toLowerCase())
                                ) &&
                                !projectStack.some(p => p.id === t.id)
                            ).map(t => (
                                <button key={t.id} onClick={() => handleAddTech(t.id)} className="w-full p-4 flex justify-between items-center hover:bg-zinc-900 rounded-2xl transition-all group/item">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">{t.categoriaPrincipal?.split(' ')[0] || '🛠️'}</div>
                                        <div className="text-left">
                                            <span className="text-white font-black block text-sm">{t.nombre}</span>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{t.categoriaPrincipal} • {t.categoriaSecundaria}</span>
                                        </div>
                                    </div>
                                    <Plus size={16} className="text-zinc-700 group-hover/item:text-emerald-500" />
                                </button>
                            ))}
                            <button onClick={createOnTheFly} className="w-full p-6 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 text-zinc-500 hover:text-emerald-500 rounded-[2rem] transition-all mt-4 flex flex-col items-center gap-2">
                                <Plus size={24} />
                                <span className="font-black text-[10px] uppercase tracking-widest">¿Falta algo? Crea una nueva herramienta</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* VISTA DE ARQUITECTURA (CHIPS PREMIUM) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mainCategories.map(cat => {
                        const techs = projectStack.filter(t => t.categoriaPrincipal === cat);
                        if (techs.length === 0) return null;
                        return (
                            <div key={cat} className="bg-zinc-950/30 p-8 rounded-[2.5rem] border border-zinc-800/40 space-y-6">
                                <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                                    {cat}
                                </h4>
                                <div className="space-y-4">
                                    {techs.map(t => (
                                        <div key={t.id} className="bg-zinc-950 border border-zinc-800/50 p-5 rounded-2xl hover:border-emerald-500/30 group/pill transition-all relative overflow-hidden">
                                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                                <Cpu size={40} className="text-zinc-400" />
                                            </div>
                                            <div className="mb-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-lg text-white font-black italic uppercase tracking-tighter">{t.nombre}</span>
                                                    <div className="flex items-center gap-1">
                                                        {t.urlDocumentacion && <a href={t.urlDocumentacion} target="_blank" className="p-2 text-zinc-700 hover:text-blue-500"><ExternalLink size={14} /></a>}
                                                        <button onClick={() => handleRemoveTech(t.id)} className="p-2 text-zinc-700 hover:text-red-500"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <span className="px-2 py-0.5 bg-emerald-500/10 text-[8px] font-black uppercase text-emerald-500 tracking-widest rounded-md border border-emerald-500/20">
                                                        {t.categoriaPrincipal}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-zinc-900 text-[8px] font-black uppercase text-zinc-500 tracking-widest rounded-md border border-zinc-800">
                                                        {t.categoriaSecundaria}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {projectStack.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                        <div className="relative inline-block">
                             <Cpu className="mx-auto text-zinc-800 animate-pulse" size={80} />
                             <div className="absolute -top-4 -right-4 bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20">
                                <AlertCircle size={16} className="text-emerald-500" />
                             </div>
                        </div>
                        <p className="text-zinc-600 font-bold italic text-sm">No hay arquitectura definida aún. Iniciá la búsqueda.</p>
                    </div>
                )}
            </div>

            {/* EXPLORADOR DE BÓVEDA (Con Preview) */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 font-sans">
                            <Layers size={24} className="text-emerald-500" /> Bóveda de Stacks
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Plantillas de arquitectura personalizadas</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map(temp => {
                         // Obtenemos los nombres de las tecnologías para la preview
                         const techNames = catalog
                            .filter(t => temp.tecnologiasIdsJson.includes(t.id))
                            .map(t => t.nombre)
                            .slice(0, 4)
                            .join(' + ');

                         return (
                            <button 
                                key={temp.id} 
                                onClick={() => loadTemplate(temp.id)}
                                className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${activeTemplateId === temp.id ? 'bg-emerald-500/5 border-emerald-500' : 'bg-zinc-900/40 border-zinc-800/60 hover:border-emerald-500/40 hover:bg-zinc-900'}`}
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform">
                                    <Layers size={100} className="text-zinc-400" />
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-tight">{temp.nombre}</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold h-8 line-clamp-2 italic">
                                        {techNames ? `${techNames}${temp.tecnologiasIdsJson.length > 4 ? '...' : ''}` : 'Sin tecnologías definidas'}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{temp.tecnologiasIdsJson.length} Componentes</span>
                                        <span className="text-zinc-700 group-hover:text-emerald-500 transition-colors"><CheckCircle2 size={16} /></span>
                                    </div>
                                </div>
                            </button>
                         );
                    })}
                </div>
            </div>

            {/* MODAL GESTOR DE CATÁLOGO */}
            {showCatalogManager && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCatalogManager(false)} />
                    <div className="relative w-full max-w-4xl bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-10 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
                        <header className="flex justify-between items-center mb-8">
                             <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Gestión de <span className="text-emerald-500">Catálogo</span></h3>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Diccionario Maestro de Tecnologías</p>
                             </div>
                             <button onClick={() => setShowCatalogManager(false)} className="p-3 hover:bg-zinc-800 rounded-2xl text-zinc-500 transition-all"><X size={24} /></button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                            {catalog.map(t => (
                                <div key={t.id} className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-[2rem] flex justify-between items-center hover:border-emerald-500/30 transition-all group">
                                     <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center text-xl shadow-inner">
                                            {t.categoriaPrincipal?.split(' ')[0] || '⚙️'}
                                        </div>
                                        <div>
                                            <h5 className="font-black text-white text-base leading-tight uppercase italic">{t.nombre}</h5>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t.categoriaPrincipal}</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{t.categoriaSecundaria}</span>
                                            </div>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleRemoveTech(t.id)} // Esto es solo un ejemplo, debería haber un Delete en Backend
                                            className="p-3 bg-zinc-900 text-zinc-700 hover:text-red-500 transition-all rounded-xl border border-zinc-800"
                                            title="Eliminar del Catálogo"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
