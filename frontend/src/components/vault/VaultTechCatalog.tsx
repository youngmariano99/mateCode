import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiClient';
import { useProject } from '../../context/ProjectContext';
import Swal from 'sweetalert2';
import { 
    Trash2, Plus, Search, Edit3, ExternalLink, Database, X 
} from 'lucide-react';

interface Tech {
    id: string;
    nombre: string;
    categoriaPrincipal: string;
    categoriaSecundaria: string;
    urlDocumentacion?: string;
    colorHex?: string;
}

export const VaultTechCatalog: React.FC = () => {
    const { tenantId } = useProject();
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
            const catData = await api.get('/Stack/catalog');
            setCatalog(catData);
        } catch (error) {
            console.error('Error fetching catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantId]);

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

    const filteredCatalog = catalog.filter(t => 
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoriaPrincipal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoriaSecundaria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center animate-pulse text-zinc-500 font-black uppercase tracking-widest">Cargando Catálogo...</div>;

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar herramientas..."
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-500/30 transition-all"
                    />
                </div>
                <button 
                    onClick={() => handleCreateOrEditTech()}
                    className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                >
                    <Plus size={18} /> Añadir Tecnología
                </button>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Emoji</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nombre</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Capa</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tipo</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCatalog.map(t => (
                                <tr key={t.id} className="hover:bg-white/5 transition-all group">
                                    <td className="px-8 py-6 text-2xl grayscale group-hover:grayscale-0 transition-all">
                                        {t.categoriaPrincipal?.split(' ')[0] || '🛠️'}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-white text-lg italic uppercase tracking-tighter">{t.nombre}</span>
                                            {t.urlDocumentacion && (
                                                <a href={t.urlDocumentacion} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                                    Docs <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1 bg-white/5 text-[10px] font-black uppercase text-zinc-400 rounded-full border border-white/5">
                                            {t.categoriaPrincipal}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1 bg-emerald-500/5 text-[10px] font-black uppercase text-emerald-400 rounded-full border border-emerald-500/10">
                                            {t.categoriaSecundaria}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => handleCreateOrEditTech(t)}
                                                className="p-3 bg-white/5 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTech(t.id, t.nombre)}
                                                className="p-3 bg-white/5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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
        </div>
    );
};
