import { Database, Link2, Globe, Loader2, CheckCircle2, Shield, Lock } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { useStagingAreaStore } from '../../store/useStagingAreaStore';
import { ErdAdapterFactory } from '../../services/ErdSyncAdapters';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

interface SyncProviderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSync?: (tables: any[]) => void;
}

export const SyncProviderModal = ({ isOpen, onClose, onSync }: SyncProviderModalProps) => {
    const store = useStagingAreaStore();
    const [sourceType, setSourceType] = useState<'supabase' | 'custom'>('supabase');
    const [config, setConfig] = useState({
        url: '',
        key: '',
        endpoint: ''
    });
    const [loading, setLoading] = useState(false);
    const [shouldSave, setShouldSave] = useState(true);
    const activeProjectId = useWorkspaceStore(state => state.activeProjectId);

    // Cargar config guardada al abrir
    useEffect(() => {
        if (isOpen && activeProjectId) {
            const loadConfig = async () => {
                try {
                    const project = await api.get(`/Project/${activeProjectId}`);
                    if (project.externalSyncUrl || project.externalSyncKey) {
                        setConfig({
                            url: project.externalSyncUrl || '',
                            key: project.externalSyncKey || '',
                            endpoint: project.externalSyncType === 'custom' ? project.externalSyncUrl : ''
                        });
                        if (project.externalSyncType) {
                            setSourceType(project.externalSyncType as any);
                        }
                    }
                } catch (err) {
                    console.error("Error cargando config de sincronización", err);
                }
            };
            loadConfig();
        }
    }, [isOpen, activeProjectId]);

    if (!isOpen) return null;

    const handleSync = async () => {
        setLoading(true);
        try {
            let rawData: any;

            if (sourceType === 'supabase') {
                const response = await api.post('/Stack/sync/supabase', { 
                    url: config.url, 
                    key: config.key 
                });
                rawData = response.tables;
            } else {
                rawData = await fetch(config.endpoint).then(res => res.json());
            }

            const adapter = ErdAdapterFactory.getAdapter(sourceType);
            const transformedTables = adapter.transform(rawData);

            if (transformedTables.length === 0) {
                throw new Error("No se detectaron tablas válidas en la respuesta del origen.");
            }

            const jsonString = JSON.stringify(transformedTables);
            const result = store.loadFromJson('erd', jsonString);

            if (result.success) {
                if (onSync) onSync(transformedTables);
                
                // Guardar config si está habilitado
                if (shouldSave && activeProjectId) {
                    await api.put(`/Project/${activeProjectId}/sync-config`, {
                        url: sourceType === 'supabase' ? config.url : config.endpoint,
                        key: config.key,
                        type: sourceType
                    });
                }

                Swal.fire({
                    icon: 'success',
                    title: '¡Sincronización Exitosa!',
                    text: `El Adaptador ha transformado y cargado ${transformedTables.length} tablas correctamente.`,
                    background: '#18181b', color: '#fff'
                });
                onClose();
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Falla en la Sincronización',
                text: err.message || 'No se pudo conectar con el origen de datos.',
                background: '#18181b', color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] flex flex-col">
                <header className="p-10 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <Globe size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">ERD <span className="text-emerald-500">Sync Bridge</span></h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Conexión con Orígenes de Datos Reales</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-2xl transition-all">✕</button>
                </header>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setSourceType('supabase')}
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${sourceType === 'supabase' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <Database size={32} />
                            <span className="text-xs font-black uppercase tracking-widest">Supabase / PG</span>
                        </button>
                        <button 
                            onClick={() => setSourceType('custom')}
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${sourceType === 'custom' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <Link2 size={32} />
                            <span className="text-xs font-black uppercase tracking-widest">Framework API</span>
                        </button>
                    </div>

                    <div className="space-y-6 bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800">
                        {sourceType === 'supabase' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Supabase Project URL</label>
                                    <input 
                                        value={config.url}
                                        onChange={e => setConfig({...config, url: e.target.value})}
                                        placeholder="https://xyz.supabase.co"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Anon / Service Key</label>
                                    <input 
                                        type="password"
                                        value={config.key}
                                        onChange={e => setConfig({...config, key: e.target.value})}
                                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Schema Endpoint URL</label>
                                <input 
                                    value={config.endpoint}
                                    onChange={e => setConfig({...config, endpoint: e.target.value})}
                                    placeholder="https://tu-api.com/v1/schema"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-blue-500/50"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem]">
                        <div className="flex items-center gap-3">
                            <Lock className="text-emerald-500" size={18} />
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Persistencia Segura</p>
                                <p className="text-[9px] text-zinc-500 font-medium uppercase mt-0.5">Las credenciales se cifran en el servidor</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={shouldSave} 
                                onChange={e => setShouldSave(e.target.checked)}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                        </label>
                    </div>
                </div>

                <footer className="p-8 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">Cancelar</button>
                    <button 
                        onClick={handleSync}
                        disabled={loading || (!config.url && !config.endpoint)}
                        className="px-10 py-4 bg-emerald-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Iniciar Sincronización
                    </button>
                </footer>
            </div>
        </div>
    );
};
