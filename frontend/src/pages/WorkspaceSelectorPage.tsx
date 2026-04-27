import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { api } from '../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Layout, Zap, Globe, Shield } from 'lucide-react';
import { MateLoadingScreen } from '../components/layout/MateLoadingScreen';
import Swal from 'sweetalert2';

import { useWorkspaceStore } from '../store/useWorkspaceStore';

interface Workspace {
  id: string;
  nombre: string;
  created_at?: string;
}

export const WorkspaceSelectorPage = () => {
  const { setTenant } = useProject();
  const { setWorkspaceId } = useWorkspaceStore();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCebando, setIsCebando] = useState(false);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      const data = await api.get('/Workspace').catch(() => []);
      setWorkspaces(data);
    } catch (err) {
      console.error("Error fetching workspaces", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedWsId(id);
    setIsCebando(true);
  };

  const onLoadingFinished = () => {
    if (selectedWsId) {
      setTenant(selectedWsId);
      setWorkspaceId(selectedWsId);
      navigate('/workspace/mi-oficina'); // O la ruta principal del mapa
    }
  };

  const handleCreateWorkspace = async () => {
    const { value: name } = await Swal.fire({
      title: 'Nuevo Mundo MateCode',
      input: 'text',
      inputLabel: '¿Cómo se llama tu nuevo espacio?',
      inputPlaceholder: 'Ej: Galaxia Dev v2',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Cimentar Espacio',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl border border-zinc-800 shadow-2xl',
        input: 'bg-zinc-900 border-zinc-800 text-white rounded-xl'
      }
    });

    if (name) {
      try {
        const newWs = await api.post('/Workspace', { Nombre: name });
        setWorkspaces(prev => [...prev, newWs]);
        Swal.fire({
          title: '¡Mundo Creado!',
          text: `Tu espacio ${name} está listo para ser cebado.`,
          icon: 'success',
          background: '#09090b',
          color: '#f4f4f5'
        });
      } catch (err) {
        console.error("Error creating workspace", err);
      }
    }
  };

  if (isCebando) {
    return <MateLoadingScreen onFinished={onLoadingFinished} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-5xl"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
            <Zap size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Selección de Ecosistema</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Bienvenido a MateCode
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Selecciona el espacio de trabajo donde vas a operar hoy. Cada mundo tiene sus propias reglas, proyectos y equipo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-2 w-full col-span-full">
             <MateLoadingScreen isEmbedded={true} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {workspaces.map((ws, index) => (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => handleSelect(ws.id)}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 group-hover:border-emerald-500/50 p-8 rounded-3xl transition-all h-full flex flex-col">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      <Briefcase size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{ws.nombre}</h3>
                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-zinc-800">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <Globe size={12} /> Public
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <Shield size={12} /> Secure
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Card de Crear Nuevo */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleCreateWorkspace}
                className="cursor-pointer border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col items-center justify-center text-zinc-600 hover:text-emerald-500 transition-all bg-zinc-900/20"
              >
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <Plus size={32} />
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">Cimentar Nuevo Mundo</span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className="mt-20 pt-10 border-t border-zinc-900 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Layout size={16} className="text-zinc-700" />
                 <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">V2.4 Immersive</span>
              </div>
           </div>
           <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.4em]">MateCode Architecture</p>
        </div>
      </motion.div>
    </div>
  );
};
