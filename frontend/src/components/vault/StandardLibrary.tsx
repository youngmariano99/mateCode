import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
    Shield, Cpu, TestTube, Layout, Zap, Plus, 
    Edit3, Trash2, ArrowLeft, Search, Filter,
    CheckSquare, Square, Trash, Sparkles, Copy, 
    ChevronRight, Info, AlertTriangle, FileJson
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

interface Estandar {
    id: string;
    categoria: string;
    nombre: string;
    descripcionDidactica: string;
    colorHex: string;
    espacioTrabajoId?: string;
}

export const StandardLibrary = () => {
    const { tenantId } = useProject();
    const [standards, setStandards] = useState<Estandar[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJson, setImportJson] = useState('');
    const [importPreview, setImportPreview] = useState<any[]>([]);
    const [importFields, setImportFields] = useState({
        arquitectura: '',
        patrones: '',
        datos: '',
        seguridad: '',
        testing: '',
        performance: '',
        uxui: '',
        documentacion: ''
    });

    const categories = ['Seguridad', 'Arquitectura', 'Testing', 'UX/UI', 'DevOps', 'Otros'];

    const fetchStandards = async () => {
        try {
            setLoading(true);
            const data = await api.get('/Standard');
            setStandards(data);
        } catch (error) {
            console.error("Error fetching standards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStandards();
    }, [tenantId]);

    const handleCreateOrEdit = async (standard?: Estandar) => {
        const { value: v } = await Swal.fire({
            title: standard ? '📝 Editar Estándar' : '🚀 Nuevo Estándar',
            background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `
                <div class="text-left space-y-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Categoría</label>
                        <select id="swal-cat" class="swal2-input bg-zinc-950 text-white w-full m-0">
                            ${categories.map(c => `<option value="${c}" ${standard?.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Nombre del Estándar</label>
                        <input id="swal-name" class="swal2-input bg-zinc-950 text-white w-full m-0" value="${standard?.nombre || ''}" placeholder="Ej: JWT ECC, Clean Architecture...">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Descripción Didáctica (Tooltip)</label>
                        <textarea id="swal-desc" class="swal2-textarea bg-zinc-950 text-white w-full m-0 h-24" placeholder="Explica por qué es importante este estándar...">${standard?.descripcionDidactica || ''}</textarea>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-black uppercase text-zinc-500">Color de Pastilla</label>
                        <input id="swal-color" type="color" class="w-full h-10 bg-zinc-950 border-none rounded-lg cursor-pointer" value="${standard?.colorHex || '#10B981'}">
                    </div>
                </div>
            `,
            preConfirm: () => ({
                categoria: (document.getElementById('swal-cat') as HTMLSelectElement).value,
                nombre: (document.getElementById('swal-name') as HTMLInputElement).value,
                descripcionDidactica: (document.getElementById('swal-desc') as HTMLTextAreaElement).value,
                colorHex: (document.getElementById('swal-color') as HTMLInputElement).value
            })
        });

        if (v && v.nombre) {
            try {
                if (standard) {
                    await api.put(`/Standard/${standard.id}`, v);
                } else {
                    await api.post('/Standard', v);
                }
                Swal.fire({ icon: 'success', title: standard ? 'Actualizado' : 'Creado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                fetchStandards();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        const result = await Swal.fire({
            title: `¿Eliminar ${nombre}?`,
            text: "Se realizará una eliminación lógica (Soft Delete).",
            icon: 'warning',
            showCancelButton: true,
            background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/Standard/${id}`);
                Swal.fire({ icon: 'success', title: 'Eliminado' });
                fetchStandards();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleBulkDelete = async () => {
        const result = await Swal.fire({
            title: `¿Eliminar ${selectedIds.length} estándares?`,
            text: "Se realizará una eliminación lógica masiva.",
            icon: 'warning',
            showCancelButton: true,
            background: '#18181b', color: '#fff', confirmButtonColor: '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                await api.post('/Standard/bulk-delete', selectedIds);
                Swal.fire({ icon: 'success', title: 'Eliminados' });
                setSelectedIds([]);
                fetchStandards();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filtered.length) setSelectedIds([]);
        else setSelectedIds(filtered.map(s => s.id));
    };

    // --- LÓGICA DE IMPORTACIÓN AI ---
    
    useEffect(() => {
        if (!importJson) {
            setImportPreview([]);
            return;
        }
        try {
            const parsed = JSON.parse(importJson);
            if (Array.isArray(parsed)) setImportPreview(parsed);
            else setImportPreview([]);
        } catch (e) {
            setImportPreview([]);
        }
    }, [importJson]);

    const handleExecuteImport = async () => {
        if (importPreview.length === 0) return;
        
        try {
            await api.post('/Standard/bulk-import', importPreview);
            Swal.fire({ icon: 'success', title: 'Importación Exitosa', text: `${importPreview.length} estándares agregados.` });
            setImportJson('');
            setShowImportModal(false);
            fetchStandards();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo importar el JSON.' });
        }
    };

    const copyPrompt = () => {
        let contextText = "";
        if (importFields.arquitectura) contextText += `- Arquitectura: ${importFields.arquitectura}\n`;
        if (importFields.patrones) contextText += `- Patrones de Diseño: ${importFields.patrones}\n`;
        if (importFields.datos) contextText += `- Modelado de Datos: ${importFields.datos}\n`;
        if (importFields.seguridad) contextText += `- Seguridad: ${importFields.seguridad}\n`;
        if (importFields.testing) contextText += `- Testing y Calidad: ${importFields.testing}\n`;
        if (importFields.performance) contextText += `- Escalabilidad y Performance: ${importFields.performance}\n`;
        if (importFields.uxui) contextText += `- UX/UI: ${importFields.uxui}\n`;
        if (importFields.documentacion) contextText += `- Documentación: ${importFields.documentacion}\n`;

        const prompt = `Actúa como un Arquitecto Senior y Tech Lead de MateCode. Generá un listado de estándares técnicos en formato JSON.
REGLAS:
- Formato: Array de objetos JSON.
- Campos: "categoria" (Debe ser uno de: Seguridad, Arquitectura, Testing, UX/UI, DevOps), "nombre", "descripcionDidactica" (Explicación breve de por qué usarlo), "colorHex" (Color vibrante representativo).
- Contexto específico solicitado:
${contextText || "Generá estándares modernos y variados para un stack Full-stack moderno."}
- Importante: Generá al menos 5 estándares de alta calidad basados en estos puntos.`;
        
        navigator.clipboard.writeText(prompt);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Prompt Generado y Copiado', showConfirmButton: false, timer: 1500 });
    };

    const filtered = standards.filter(s => 
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'seguridad': return <Shield size={20} />;
            case 'arquitectura': return <Cpu size={20} />;
            case 'testing': return <TestTube size={20} />;
            case 'ux/ui': return <Layout size={20} />;
            default: return <Zap size={20} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <Link to="/app/vault" className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                            Biblioteca de <span className="text-emerald-500">Estándares</span>
                        </h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Definición de Blueprints de Ingeniería</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowImportModal(true)}
                        className="px-6 py-4 bg-zinc-900 border border-zinc-800 text-emerald-500 rounded-2xl text-xs font-black uppercase flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl"
                    >
                        <Sparkles size={20} /> Importador AI
                    </button>
                    <button 
                        onClick={() => handleCreateOrEdit()}
                        className="px-8 py-4 bg-emerald-500 text-zinc-950 rounded-2xl text-xs font-black uppercase flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20"
                    >
                        <Plus size={20} /> Nuevo Estándar
                    </button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/10 p-6 rounded-[2.5rem] border border-zinc-900/20">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={handleSelectAll}
                        className={`p-3 rounded-xl border transition-all ${selectedIds.length === filtered.length && filtered.length > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                        title="Seleccionar todo"
                    >
                        {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar estándares..."
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-emerald-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {selectedIds.length > 0 && (
                        <button 
                            onClick={handleBulkDelete}
                            className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-500/20 transition-all"
                        >
                            <Trash size={14} /> Eliminar Seleccionados ({selectedIds.length})
                        </button>
                    )}
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        <Filter size={14} /> {filtered.length} Resultados
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-32 text-center">
                    <div className="animate-spin inline-block w-10 h-10 border-4 border-current border-t-transparent text-emerald-500 rounded-full mb-4" />
                    <p className="text-zinc-500 font-bold italic">Sincronizando catálogo...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((s) => (
                        <div 
                            key={s.id} 
                            onClick={() => handleToggleSelect(s.id)}
                            className={`group p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden cursor-pointer ${selectedIds.includes(s.id) ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-zinc-700'}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl transition-all ${selectedIds.includes(s.id) ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-950 text-emerald-500'}`}>
                                        {getIcon(s.categoria)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.categoria}</p>
                                        <h3 className="font-black text-slate-900 dark:text-white text-xl italic uppercase tracking-tighter">{s.nombre}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleCreateOrEdit(s); }} className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-lg transition-all"><Edit3 size={18} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id, s.nombre); }} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            
                            <p className="text-xs text-zinc-500 leading-relaxed italic border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 mb-6 line-clamp-3">
                                "{s.descripcionDidactica || 'Sin descripción técnica disponible.'}"
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ backgroundColor: s.colorHex }}></div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">{s.colorHex}</span>
                                </div>
                                {selectedIds.includes(s.id) ? (
                                    <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500">Seleccionado</span>
                                ) : (
                                    <span className="text-[9px] font-black uppercase text-zinc-600 bg-zinc-800/20 px-3 py-1 rounded-full border border-zinc-800">Inactivo</span>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {filtered.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-[3rem]">
                            <p className="text-zinc-500 font-bold italic">No hay estándares que coincidan con la búsqueda.</p>
                        </div>
                    )}
                </div>
            )}

            {/* --- MODAL DE IMPORTACIÓN AI --- */}
            {showImportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl h-[85vh] rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(16,185,129,0.1)]">
                        <header className="p-10 border-b border-zinc-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Importador AI <span className="text-emerald-500">Wizard</span></h2>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Generá estándares masivos mediante JSON</p>
                                </div>
                            </div>
                            <button onClick={() => setShowImportModal(false)} className="p-4 text-zinc-500 hover:text-white transition-all bg-zinc-950 rounded-2xl border border-zinc-800">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </header>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Panel Izquierdo: Constructor de Prompt */}
                            <div className="w-full md:w-1/2 p-8 space-y-8 border-r border-zinc-800 overflow-y-auto custom-scrollbar bg-zinc-900/50">
                                <div className="space-y-4">
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Info className="text-emerald-500" size={18} />
                                            <h4 className="text-xs font-black text-white uppercase italic">Tutorial de Importación</h4>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                                            Completá los campos técnicos abajo con los nombres o conceptos que querés estandarizar. 
                                            Luego hacé clic en el botón <span className="text-emerald-500 font-bold">Generar Prompt</span> para copiarlo y pegarlo en una IA externa (GPT, Claude, etc).
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { label: 'Arquitectura', key: 'arquitectura', placeholder: 'Clean Arch, Hexagonal, SOA...' },
                                            { label: 'Patrones de Diseño', key: 'patrones', placeholder: 'SOLID, Factory, CQRS...' },
                                            { label: 'Modelado de Datos', key: 'datos', placeholder: 'Normalización, Índices, RLS...' },
                                            { label: 'Seguridad', key: 'seguridad', placeholder: 'JWT, OAuth2, 2FA, Encriptación...' },
                                            { label: 'Testing y Calidad', key: 'testing', placeholder: 'Unit, E2E, Mutación, Linting...' },
                                            { label: 'Escalabilidad / Perf', key: 'performance', placeholder: 'Caching, Lazy Loading, CDN...' },
                                            { label: 'UX / UI', key: 'uxui', placeholder: 'Design System, Accessibility, Responsiveness...' },
                                            { label: 'Documentación', key: 'documentacion', placeholder: 'Swagger, Readme, JSDoc...' },
                                        ].map(field => (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">{field.label}</label>
                                                <input 
                                                    value={(importFields as any)[field.key]}
                                                    onChange={e => setImportFields({ ...importFields, [field.key]: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-5 text-xs text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 font-medium"
                                                    placeholder={`Ej: ${field.placeholder}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={copyPrompt}
                                        className="w-full py-5 bg-emerald-500 text-zinc-950 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
                                    >
                                        <Copy size={18} /> Generar y Copiar Prompt para IA
                                    </button>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-zinc-800">
                                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                        <FileJson size={14} /> Paso Final: Pegá el JSON de la IA
                                    </div>
                                    <textarea 
                                        value={importJson}
                                        onChange={e => setImportJson(e.target.value)}
                                        className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500/50 transition-all resize-none custom-scrollbar"
                                        placeholder="Pega aquí el array JSON generado por la IA..."
                                    />
                                    {importJson && importPreview.length === 0 && (
                                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase animate-pulse">
                                            <AlertTriangle size={14} /> JSON No Válido
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panel Derecho: Preview */}
                            <div className="w-full md:w-1/2 p-10 bg-zinc-950/30 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                                        <div className="text-white text-[10px] font-black uppercase tracking-widest">Vista Previa ({importPreview.length})</div>
                                        <div className="text-zinc-600 text-[9px] uppercase italic">Valores detectados</div>
                                    </div>

                                    {importPreview.length > 0 ? (
                                        <div className="space-y-4">
                                            {importPreview.map((item, idx) => (
                                                <div key={idx} className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 flex items-center gap-4 animate-in slide-in-from-right-4 duration-300" style={{ transitionDelay: `${idx * 50}ms` }}>
                                                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: item.colorHex || '#10B981' }}></div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">{item.categoria}</span>
                                                            <ChevronRight size={8} className="text-zinc-700" />
                                                            <span className="text-xs font-black text-zinc-100 italic uppercase">{item.nombre}</span>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500 italic mt-1 line-clamp-1">{item.descripcionDidactica}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center space-y-4 opacity-30">
                                            <Zap size={48} className="mx-auto text-zinc-700" />
                                            <p className="text-xs text-zinc-600 italic">Esperando JSON para procesar...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <footer className="p-10 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                            <div className="text-[10px] text-zinc-600 italic max-w-sm">
                                "La IA es tu copiloto, pero vos sos el Capitán. Revisá bien el Preview antes de consolidar los estándares."
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => { setImportJson(''); setShowImportModal(false); }}
                                    className="px-8 py-4 bg-zinc-950 text-zinc-500 rounded-2xl text-xs font-black uppercase border border-zinc-800 hover:text-white transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    disabled={importPreview.length === 0}
                                    onClick={handleExecuteImport}
                                    className={`px-10 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-3 transition-all ${importPreview.length > 0 ? 'bg-emerald-500 text-zinc-950 shadow-2xl shadow-emerald-500/20 hover:scale-105' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                                >
                                    Consolidar e Importar
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StandardLibrary;
