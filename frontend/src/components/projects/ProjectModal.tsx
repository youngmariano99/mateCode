import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Rocket, Briefcase, FileText } from 'lucide-react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectToEdit?: { id: string; nombre: string; descripcion?: string; cliente_id?: string } | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  projectToEdit 
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setNombre(projectToEdit.nombre);
      setDescripcion(projectToEdit.descripcion || '');
    } else {
      setNombre('');
      setDescripcion('');
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    try {
      if (projectToEdit) {
        await api.put(`/Project/${projectToEdit.id}`, { Nombre: nombre, Descripcion: descripcion });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Proyecto actualizado',
          showConfirmButton: false,
          timer: 2000,
          background: '#18181b',
          color: '#fff'
        });
      } else {
        await api.post('/Project', { Nombre: nombre, Descripcion: descripcion });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: '¡Nuevo proyecto desplegado!',
          showConfirmButton: false,
          timer: 3000,
          background: '#18181b',
          color: '#fff'
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-8">
              <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                      {projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                    </h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Arquitectura de Misión</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 transition-all"
                >
                  <X size={20} />
                </button>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-2">Nombre del Proyecto</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-5 flex items-center text-zinc-500">
                      <Briefcase size={18} />
                    </div>
                    <input 
                      autoFocus
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Quantum ERP v2.0"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-2">Descripción / Contexto</label>
                  <div className="relative">
                    <div className="absolute top-4 left-5 text-zinc-500">
                      <FileText size={18} />
                    </div>
                    <textarea 
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe brevemente los objetivos de este proyecto..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !nombre}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      <span className="uppercase tracking-widest text-xs">Desplegar Cambios</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
