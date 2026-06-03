import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';
import type { Member } from '../../store/useAgencyStore';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface ContentPanelProps {
  agencyMembers: Member[];
}

export const ContentPanel: React.FC<ContentPanelProps> = ({ agencyMembers }) => {
  const { contents, fetchContents, createContent, deleteContent } = useOperationsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    miembroId: '',
    titulo: '',
    plataformas: 'TikTok',
    guionPlantilla: '',
    dialogo: '',
    procedimientoEstandar: '',
    estado: 'Idea',
    notasMejora: ''
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const platforms = form.plataformas.split(',').map(p => p.trim()).filter(Boolean);
      await createContent({
        miembroId: form.miembroId,
        titulo: form.titulo,
        plataformas: platforms,
        guionPlantilla: form.guionPlantilla,
        dialogo: form.dialogo,
        procedimientoEstandar: form.procedimientoEstandar,
        estado: form.estado,
        notasMejora: form.notasMejora
      });
      setIsModalOpen(false);
      setForm({
        miembroId: '',
        titulo: '',
        plataformas: 'TikTok',
        guionPlantilla: '',
        dialogo: '',
        procedimientoEstandar: '',
        estado: 'Idea',
        notasMejora: ''
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar planificación?',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) {
      await deleteContent(id);
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Planificación de Contenidos</h1>
          <p className="text-zinc-500 text-xs mt-1">Estructura guiones, graba y evalúa tus publicaciones de marketing en redes sociales.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          <span>Nuevo Video / Guión</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.length === 0 ? (
          <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-600 text-sm">
            No hay guiones o ideas cargadas en el planificador.
          </div>
        ) : (
          contents.map(c => (
            <div key={c.id} className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {c.plataformas.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md text-[9px] font-black uppercase text-zinc-400">
                        {p}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="text-zinc-605 hover:text-red-405 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                
                <h4 className="font-bold text-sm text-white mb-2">{c.titulo}</h4>
                
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block mb-4 ${
                  c.estado === 'Publicado' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {c.estado}
                </span>

                {c.guion_plantilla && (
                  <div className="text-xs text-zinc-400 bg-zinc-950/40 p-4 rounded-xl font-mono border border-zinc-900 max-h-[120px] overflow-y-auto neon-scrollbar whitespace-pre-wrap">
                    <p className="font-bold text-[10px] text-zinc-500 uppercase mb-1">Estructura / Gancho:</p>
                    {c.guion_plantilla}
                  </div>
                )}

                {c.dialogo && (
                  <div className="text-xs text-zinc-400 bg-zinc-950/40 p-4 rounded-xl mt-2 font-mono border border-zinc-900 max-h-[120px] overflow-y-auto neon-scrollbar whitespace-pre-wrap">
                    <p className="font-bold text-[10px] text-zinc-500 uppercase mb-1">Diálogo / Guión:</p>
                    {c.dialogo}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Nueva Planificación de Contenido</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Miembro Responsable</label>
                <select required value={form.miembroId} onChange={e => setForm({ ...form, miembroId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                  <option value="">Selecciona miembro...</option>
                  {agencyMembers.map(m => (
                    <option key={m.usuario_id} value={m.usuario_id}>{m.usuario?.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título del Video / Tema</label>
                <input required type="text" placeholder="Ej: 3 trucos para mejorar performance de C#" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Plataformas (Separadas por comas)</label>
                <input type="text" placeholder="TikTok, Instagram, YouTube" value={form.plataformas} onChange={e => setForm({ ...form, plataformas: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Estructura / Gancho Inicial</label>
                <textarea rows={2} value={form.guionPlantilla} onChange={e => setForm({ ...form, guionPlantilla: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Diálogo Completo</label>
                <textarea rows={4} value={form.dialogo} onChange={e => setForm({ ...form, dialogo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-mono" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Crear Planificación</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
