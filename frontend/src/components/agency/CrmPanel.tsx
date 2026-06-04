import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, UserPlus } from 'lucide-react';
import { useCrmStore, type Lead } from '../../store/useCrmStore';
import { AgencyFormsPanel } from './AgencyFormsPanel';
import { AgencyContractsSubPanel } from './AgencyContractsSubPanel';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export const CrmPanel: React.FC = () => {
  const { leads, fetchLeads, createLead, updateLead, updateLeadStatus, deleteLead } = useCrmStore();
  const [activeTab, setActiveTab] = useState<'kanban' | 'forms' | 'contracts' | 'responses'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [associatingLead, setAssociatingLead] = useState<Lead | null>(null);
  const [associationSearch, setAssociationSearch] = useState('');
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

  const isFormResponse = (lead: Lead) => {
    const ctx = lead.contextoJson || (lead as any).contexto_json;
    return ctx?.esRespuestaFormulario === true;
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setForm({
      nombre: lead.nombre,
      email: lead.email || '',
      categoria: lead.categoria,
      calificacion: lead.calificacion,
      origenContacto: lead.origenContacto || '',
      motivoContacto: lead.motivoContacto || '',
      descripcion: lead.descripcion || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    setForm({
      nombre: '',
      email: '',
      categoria: 'Lead',
      calificacion: 'Calificado',
      origenContacto: '',
      motivoContacto: '',
      descripcion: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, form);
      } else {
        await createLead(form);
      }
      handleCloseModal();
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

  const handleConvertToLead = async (lead: Lead) => {
    try {
      const ctx = { ...(lead.contextoJson || (lead as any).contexto_json || {}) };
      ctx.esRespuestaFormulario = false;
      await updateLead(lead.id, { contextoJson: ctx });
      Swal.fire({
        title: 'Prospecto Promovido',
        text: 'La respuesta de formulario se ha convertido en lead activo del CRM.',
        icon: 'success',
        timer: 1800
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleOpenAssociateModal = (lead: Lead) => {
    setAssociatingLead(lead);
    setAssociationSearch('');
  };

  const handleAssociateConfirm = async (targetClient: Lead) => {
    if (!associatingLead) return;
    try {
      const ctx = associatingLead.contextoJson || (associatingLead as any).contexto_json || {};
      const contextDetails = Object.entries(ctx)
        .filter(([key]) => key !== 'esRespuestaFormulario' && key !== 'formTemplateId' && key !== 'nombre' && key !== 'email')
        .map(([key, value]) => `• ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n');

      const mergedDescription = `${targetClient.descripcion || ''}\n\n--- Respuesta de Formulario (${new Date(associatingLead.fechaCreacion).toLocaleDateString()}) ---\n${contextDetails || associatingLead.descripcion || ''}`;

      await updateLead(targetClient.id, { descripcion: mergedDescription });
      await deleteLead(associatingLead.id);
      
      setAssociatingLead(null);
      Swal.fire({
        title: 'Asociación Exitosa',
        text: 'Las respuestas del formulario se han incorporado al cliente.',
        icon: 'success',
        timer: 1800
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {activeTab === 'kanban' 
                ? 'Clientes & Leads (CRM)' 
                : activeTab === 'forms' 
                ? 'Formularios de Captación' 
                : activeTab === 'contracts'
                ? 'Contratos Digitales'
                : 'Respuestas de Formularios'}
            </h1>
            <p className="text-zinc-500 text-xs mt-1">
              {activeTab === 'kanban'
                ? 'Arrastra y suelta prospectos para calificar tus oportunidades de venta de software.'
                : activeTab === 'forms'
                ? 'Crea y administra los cuestionarios de relevamiento para captar clientes desde tu enlace mágico.'
                : activeTab === 'contracts'
                ? 'Formaliza tus relaciones comerciales con firmas digitales criptográficas dibujables.'
                : 'Inbox de respuestas completadas por clientes potenciales a través del enlace mágico.'}
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
            onClick={() => setActiveTab('responses')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'responses' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span>Respuestas Recibidas</span>
              {leads.filter(isFormResponse).length > 0 && (
                <span className="bg-purple-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                  {leads.filter(isFormResponse).length}
                </span>
              )}
            </div>
            {activeTab === 'responses' && (
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
          <button
            onClick={() => setActiveTab('contracts')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'contracts' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Contratos Digitales</span>
            {activeTab === 'contracts' && (
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
                    {leads.filter(l => l.categoria === col.key && !isFormResponse(l)).length}
                  </span>
                </h4>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] neon-scrollbar pr-1">
                  {leads.filter(l => l.categoria === col.key && !isFormResponse(l)).map(lead => (
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
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(lead)}
                            className="text-zinc-500 hover:text-white transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
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
        ) : activeTab === 'responses' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.filter(isFormResponse).length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-550 bg-zinc-900/10 border border-zinc-800/40 rounded-3xl">
                  No hay respuestas de formularios en la bandeja de entrada.
                </div>
              ) : (
                leads.filter(isFormResponse).map(lead => {
                  const ctx = lead.contextoJson || (lead as any).contexto_json || {};
                  return (
                    <div
                      key={lead.id}
                      className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-3xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                              Respuesta Formulario
                            </span>
                            <span className="text-[10px] text-zinc-500 block mt-1">
                              {new Date(lead.fechaCreacion).toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-zinc-650 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h4 className="font-extrabold text-white text-sm">{lead.nombre}</h4>
                        {lead.email && <p className="text-xs text-zinc-400">{lead.email}</p>}
                        
                        <div className="bg-zinc-950/45 p-3.5 rounded-2xl text-[11px] text-zinc-400 space-y-1.5 max-h-[220px] overflow-y-auto neon-scrollbar">
                          {Object.entries(ctx)
                            .filter(([key]) => key !== 'esRespuestaFormulario' && key !== 'formTemplateId' && key !== 'nombre' && key !== 'email')
                            .map(([key, val]) => (
                              <div key={key} className="border-b border-zinc-900/40 pb-1 last:border-b-0">
                                <span className="font-bold text-zinc-500 block capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-white block whitespace-pre-wrap">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-zinc-850">
                        <button
                          onClick={() => handleConvertToLead(lead)}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={12} />
                          <span>Convertir a Lead</span>
                        </button>
                        <button
                          onClick={() => handleOpenAssociateModal(lead)}
                          className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size={12} />
                          <span>Asociar a Cliente</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'forms' ? (
          <AgencyFormsPanel />
        ) : (
          <AgencyContractsSubPanel />
        )}
      </div>

      {/* Modal Carga/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">
              {selectedLead ? 'Editar Prospecto / Lead' : 'Cargar Nuevo Prospecto / Lead'}
            </h3>
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
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="Lead">Lead</option>
                    <option value="Llamada agendada">Llamada agendada</option>
                    <option value="Propuesta enviada">Propuesta enviada</option>
                    <option value="Aceptado">Ganado / Aceptado</option>
                    <option value="Rechazado">Perdido / Rechazado</option>
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
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">
                  {selectedLead ? 'Guardar Cambios' : 'Crear Lead'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Associate Lead Modal */}
      {associatingLead && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Asociar Respuesta a Cliente Existente</h3>
            <p className="text-xs text-zinc-400">
              Se fusionarán las respuestas de <strong>{associatingLead.nombre}</strong> al historial del cliente seleccionado y se borrará esta respuesta temporal.
            </p>
            <input
              type="text"
              placeholder="Buscar cliente por nombre o email..."
              value={associationSearch}
              onChange={e => setAssociationSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white"
            />
            <div className="max-h-[250px] overflow-y-auto neon-scrollbar space-y-2 border border-zinc-850 p-2 rounded-2xl bg-zinc-950/20">
              {leads
                .filter(l => !isFormResponse(l))
                .filter(l => 
                  l.nombre.toLowerCase().includes(associationSearch.toLowerCase()) || 
                  (l.email && l.email.toLowerCase().includes(associationSearch.toLowerCase()))
                )
                .map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleAssociateConfirm(client)}
                    className="w-full text-left p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-850 hover:border-zinc-700 transition-all text-xs flex flex-col gap-0.5"
                  >
                    <span className="font-bold text-white">{client.nombre}</span>
                    {client.email && <span className="text-[10px] text-zinc-500">{client.email}</span>}
                  </button>
                ))}
              {leads.filter(l => !isFormResponse(l)).length === 0 && (
                <p className="text-center text-xs text-zinc-500 py-4">No hay clientes registrados en el CRM.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                onClick={() => setAssociatingLead(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-350 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
