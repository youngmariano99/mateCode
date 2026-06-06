import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, Globe, Shield, Plus } from 'lucide-react';

interface Workspace {
  id: string;
  nombre: string;
  created_at?: string;
}

interface WorkspaceGridProps {
  workspaces: Workspace[];
  onBack: () => void;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: () => Promise<void>;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  workspaces,
  onBack,
  onSelectWorkspace,
  onCreateWorkspace,
}) => {
  return (
    <div>
      {/* Back Button */}
      <div className="flex justify-start mb-6">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-emerald-400 transition-colors flex items-center gap-2 text-xs font-bold text-zinc-400"
        >
          <ArrowLeft size={14} />
          <span>Volver a Organizaciones</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {workspaces.map((ws, index) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectWorkspace(ws.id)}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
              <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 group-hover:border-emerald-500/50 p-6 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[180px]">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                  <Briefcase size={20} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{ws.nombre}</h3>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-550 uppercase tracking-widest">
                      <Globe size={11} /> Público
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-550 uppercase tracking-widest">
                      <Shield size={11} /> Cifrado
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Card Crear Workspace */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={onCreateWorkspace}
            className="cursor-pointer border border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all bg-zinc-900/10 h-[180px]"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-805 flex items-center justify-center mb-3">
              <Plus size={24} />
            </div>
            <span className="font-bold uppercase tracking-widest text-[10px]">Cimentar Nuevo Mundo</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
