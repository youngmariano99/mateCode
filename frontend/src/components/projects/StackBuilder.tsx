import { useState, useEffect } from 'react';
import { Layers, Save, Settings2, RefreshCw, PlusCircle } from 'lucide-react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

// Sub-componentes modularizados
import type { Tech, Template } from './stack/types';
import { MAIN_CATEGORIES, SECONDARY_CATEGORIES } from './stack/types';
import { StackSearch } from './stack/StackSearch';
import { StackArchitectView } from './stack/StackArchitectView';
import { VaultLibrary } from './stack/VaultLibrary';
import { CatalogModal } from './stack/CatalogModal';

export const StackBuilder = ({ projectId, tenantId }: { projectId: string; tenantId: string }) => {
    // ESTADO CENTRAL
    const [catalog, setCatalog] = useState<Tech[]>([]);
    const [projectStack, setProjectStack] = useState<Tech[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [showCatalogManager, setShowCatalogManager] = useState(false);

    // CARGA INICIAL
    const loadData = async () => {
        try {
            const [catData, stackData, tempsData] = await Promise.all([
                api.get('/Stack/catalog'),
                api.get(`/Stack/project/${projectId}`),
                api.get('/Stack/templates')
            ]);

            setCatalog(catData);
            setTemplates(tempsData);
            setProjectStack(stackData.map((s: any) => s.tecnologia).filter(Boolean));
        } catch (err) {
            console.error("Error cargando datos del stack:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [projectId, tenantId]);

    // LÓGICA DE STACK
    const syncStack = async (newStack: Tech[]) => {
        try {
            await api.post(`/Stack/project/${projectId}`, newStack.map(t => t.id));
        } catch (err) {
            console.error("Error sincronizando stack:", err);
        }
    };

    const handleAddTech = (techId: string) => {
        if (projectStack.some(t => t.id === techId)) return;
        const tech = catalog.find(t => t.id === techId);
        if (!tech) return;
        const newStack = [...projectStack, tech];
        setProjectStack(newStack);
        syncStack(newStack);
    };

    const handleRemoveTech = (techId: string) => {
        const newStack = projectStack.filter(t => t.id !== techId);
        setProjectStack(newStack);
        syncStack(newStack);
    };

    // LÓGICA DE BÓVEDA (VAULT)
    const loadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        
        // Normalización de IDs (soporta Array nativo o String JSON)
        let techIds: string[] = [];
        try {
            if (Array.isArray(template.tecnologiasIdsJson)) {
                techIds = template.tecnologiasIdsJson;
            } else if (typeof template.tecnologiasIdsJson === 'string') {
                techIds = JSON.parse(template.tecnologiasIdsJson);
            }
        } catch (e) {
            console.error("Error parseando IDs de la plantilla:", e);
        }

        if (techIds.length === 0) return;

        const techs = catalog.filter(t => 
            techIds.some((id: string) => id.toLowerCase() === t.id.toLowerCase())
        );
        
        setProjectStack(techs);
        syncStack(techs);
        setActiveTemplateId(templateId);
        Swal.fire({ icon: 'success', title: 'Plantilla Aplicada', text: template.nombre, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    };

    const handleSaveNew = async () => {
        const { value: name } = await Swal.fire({
            title: '💾 Guardar como Nueva Plantilla',
            input: 'text',
            inputLabel: 'Nombre de la arquitectura',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            showCancelButton: true
        });

        if (name) {
            try {
                const newTemp = await api.post('/Stack/templates', { Nombre: name, tecnologiasIdsJson: projectStack.map(t => t.id) });
                setTemplates(prev => [...prev, newTemp]);
                setActiveTemplateId(newTemp.id);
                Swal.fire({ icon: 'success', title: 'Guardado en Bóveda' });
            } catch (err) {
                console.error("Error guardando plantilla:", err);
            }
        }
    };

    const handleUpdateActive = async () => {
        if (!activeTemplateId) return;
        const currentTemplate = templates.find(t => t.id === activeTemplateId);
        if (!currentTemplate) return;

        // Normalización de IDs antiguos para el cálculo de diferencias
        let oldIds: string[] = [];
        try {
            if (Array.isArray(currentTemplate.tecnologiasIdsJson)) {
                oldIds = currentTemplate.tecnologiasIdsJson.map((id: string) => id.toLowerCase());
            } else if (typeof currentTemplate.tecnologiasIdsJson === 'string') {
                oldIds = (JSON.parse(currentTemplate.tecnologiasIdsJson) as string[]).map(id => id.toLowerCase());
            }
        } catch (e) {
            console.error("Error al comparar IDs antiguos:", e);
        }

        const newIds = projectStack.map(t => t.id.toLowerCase());
        const added = projectStack.filter(t => !oldIds.includes(t.id.toLowerCase()));
        const removed = catalog.filter(t => oldIds.includes(t.id.toLowerCase()) && !projectStack.some(p => p.id.toLowerCase() === t.id.toLowerCase()));

        const { isConfirmed } = await Swal.fire({
            title: '¿Actualizar Plantilla?',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            showCancelButton: true,
            html: `
                <div class="text-left text-xs space-y-4">
                    <p>Se guardarán los cambios en <strong>${currentTemplate.nombre}</strong>:</p>
                    ${added.length > 0 ? `<div class="text-emerald-500 font-bold">+ Agregado: ${added.map(a => a.nombre).join(', ')}</div>` : ''}
                    ${removed.length > 0 ? `<div class="text-red-500 font-bold">- Quitado: ${removed.map(r => r.nombre).join(', ')}</div>` : ''}
                    ${added.length === 0 && removed.length === 0 ? '<p class="text-zinc-500 italic">No hay cambios detectados.</p>' : ''}
                </div>
            `
        });

        if (isConfirmed) {
            try {
                await api.put(`/Stack/templates/${activeTemplateId}`, { ...currentTemplate, tecnologiasIdsJson: projectStack.map(t => t.id) });
                Swal.fire({ icon: 'success', title: 'Bóveda Actualizada' });
                loadData();
            } catch (err) {
                console.error("Error actualizando plantilla:", err);
            }
        }
    };

    // LÓGICA DE CATÁLOGO
    const createOnTheFly = async () => {
        const { value: v } = await Swal.fire({
            title: '🚀 Nueva Tecnología',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-4">
                    <input id="swal-name" class="swal2-input bg-zinc-950 text-white w-full m-0" placeholder="Nombre">
                    <select id="swal-main" class="swal2-input bg-zinc-950 text-white w-full m-0">
                        ${MAIN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="swal-sec" class="swal2-input bg-zinc-950 text-white w-full m-0">
                        ${SECONDARY_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
            `,
            preConfirm: () => ({
                nombre: (document.getElementById('swal-name') as HTMLInputElement).value,
                categoriaPrincipal: (document.getElementById('swal-main') as HTMLSelectElement).value,
                categoriaSecundaria: (document.getElementById('swal-sec') as HTMLSelectElement).value
            })
        });

        if (v && v.nombre) {
            try {
                const newTech = await api.post('/Stack/catalog', v);
                setCatalog(prev => [...prev, newTech]);
                handleAddTech(newTech.id);
            } catch (err) {
                console.error("Error creando tecnología:", err);
            }
        }
    };

    const handleDeleteTech = async (techId: string) => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Eliminar Tecnología?',
            text: "Esta acción es irreversible y eliminará la tecnología del catálogo.",
            icon: 'warning',
            showCancelButton: true,
            background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
        });

        if (isConfirmed) {
            try {
                await api.delete(`/Stack/catalog/${techId}`);
                setCatalog(prev => prev.filter(t => t.id !== techId));
                setProjectStack(prev => prev.filter(t => t.id !== techId));
                Swal.fire({ icon: 'success', title: 'Eliminado del catálogo', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            } catch (err: any) {
                Swal.fire({ icon: 'error', title: 'Error', text: err.message });
            }
        }
    };

    if (loading) return <div className="h-96 bg-zinc-950 animate-pulse rounded-[3rem]" />;

    return (
        <section className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* COCKPIT DE DISEÑO */}
            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-[3.5rem] p-12 relative overflow-visible">
                <header className="flex flex-col md:flex-row justify-between gap-8 items-center mb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center text-emerald-500 shadow-2xl">
                            <Layers size={40} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Designer Stack <span className="text-emerald-500">Master</span></h2>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Estructura Arquitectónica</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowCatalogManager(true)} className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white rounded-2xl transition-all shadow-lg active:scale-95"><Settings2 size={24} /></button>
                        
                        {activeTemplateId ? (
                            <div className="flex items-center gap-2">
                                <button onClick={handleUpdateActive} className="px-6 py-4 bg-emerald-500 text-black rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10">
                                    <RefreshCw size={16} /> Actualizar Bóveda
                                </button>
                                <button onClick={handleSaveNew} className="px-6 py-4 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:text-white transition-all">
                                    <PlusCircle size={16} /> Guardar como Nuevo
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleSaveNew} className="px-8 py-4 bg-zinc-950 border border-zinc-800 text-emerald-500 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:border-emerald-500/30 transition-all shadow-lg">
                                <Save size={18} /> Crear Plantilla Nueva
                            </button>
                        )}
                    </div>
                </header>

                <StackSearch 
                    catalog={catalog} 
                    projectStack={projectStack} 
                    onAddTech={handleAddTech} 
                    onCreateOnTheFly={createOnTheFly} 
                />

                <StackArchitectView 
                    projectStack={projectStack} 
                    onRemoveTech={handleRemoveTech} 
                />
            </div>

            <VaultLibrary 
                templates={templates} 
                catalog={catalog} 
                activeTemplateId={activeTemplateId} 
                onLoadTemplate={loadTemplate} 
            />

            {showCatalogManager && (
                <CatalogModal 
                    catalog={catalog} 
                    onDeleteTech={handleDeleteTech} 
                    onClose={() => setShowCatalogManager(false)} 
                />
            )}
        </section>
    );
};
