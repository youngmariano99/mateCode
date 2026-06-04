import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCrmStore } from '../../store/useCrmStore';
import { AgencyFormsPanel } from './AgencyFormsPanel';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export const CrmPanel: React.FC = () => {
  const { leads, fetchLeads, createLead, updateLeadStatus, deleteLead } = useCrmStore();
  const [activeTab, setActiveTab] = useState<'kanban' | 'forms'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    categoria: 'Lead',
    calificacion: 'Calificado',
    origenContacto: '',
    motivoContacto: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(form);
      setIsModalOpen(false);
      setForm({
        nombre: '',
        email: '',
        categoria: 'Lead',
        calificacion: 'Calificado',
        origenContacto: '',
        motivoContacto: '',
        descripcion: ''
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      await updateLeadStatus(id, targetCategory);
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar prospecto?',
      text: 'Esta acción no se puede deshacer.',
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
      await deleteLead(id);
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {activeTab === 'kanban' ? 'Clientes & Leads (CRM)' : 'Formularios de Captación'}
            </h1>
            <p className="text-zinc-550 text-xs mt-1">
              {activeTab === 'kanban'
                ? 'Arrastra y suelta prospectos para calificar tus oportunidades de venta de software.'
                : 'Crea y administra los cuestionarios de relevamiento para captar clientes desde tu enlace mágico.'}
            </p>
          </div>
          {activeTab === 'kanban' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus size={14} />
              <span>Cargar Lead</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'kanban' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Tablero Kanban</span>
            {activeTab === 'kanban' && (
              <motion.div layoutId="crmSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'forms' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Formularios de Captación</span>
            {activeTab === 'forms' && (
              <motion.div layoutId="crmSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
            {[
              { key: 'Lead', label: 'Lead / Prospecto' },
              { key: 'Llamada agendada', label: 'Llamada Agendada' },
              { key: 'Propuesta enviada', label: 'Propuesta Enviada' },
              { key: 'Aceptado', label: 'Ganado / Aceptado' },
              { key: 'Rechazado', label: 'Perdido / Rechazado' }
            ].map(col => (
              <div
                key={col.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.key)}
                className="bg-zinc-900/30 border border-zinc-800/60 rounded-3xl p-4 flex flex-col min-h-[500px]"
              >
                <h4 className="text-xs font-black uppercase text-zinc-400 border-b border-zinc-800 pb-2.5 mb-4 tracking-wider flex justify-between items-center">
                  <span>{col.label}</span>
                  <span className="bg-zinc-800/50 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full">
                    {leads.filter(l => l.categoria === col.key).length}
                  </span>
                </h4>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] neon-scrollbar pr-1">
                  {leads.filter(l => l.categoria === col.key).map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-zinc-900/70 border border-zinc-850 hover:border-zinc-700/80 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all space-y-2.5 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          lead.calificacion === 'Calificado' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {lead.calificacion}
                        </span>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <h5 className="font-bold text-white text-xs">{lead.nombre}</h5>
                      {lead.email && <p className="text-[10px] text-zinc-500">{lead.email}</p>}
                      {lead.descripcion && <p className="text-[10px] text-zinc-400 line-clamp-2 bg-zinc-950/20 p-2 rounded-lg">{lead.descripcion}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AgencyFormsPanel />
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
            <h3 className="text-lg font-bold text-white">Cargar Nuevo Prospecto / Lead</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Nombre Completo</label>
                <input required type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Email de Contacto</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Categoría Inicial</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="Lead">Lead</option>
                    <option value="Llamada agendada">Llamada agendada</option>
                    <option value="Propuesta enviada">Propuesta enviada</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Calificación</label>
                  <select value={form.calificacion} onChange={e => setForm({ ...form, calificacion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="Calificado">Calificado</option>
                    <option value="No calificado">No calificado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Origen (Ej: LinkedIn, Video, etc)</label>
                <input type="text" value={form.origenContacto} onChange={e => setForm({ ...form, origenContacto: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Breve Descripción / Requerimientos</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Crear Lead</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
