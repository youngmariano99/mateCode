import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ContractEditorFormProps {
  form: any;
  setForm: (val: any) => void;
  leads: any[];
  members: any[];
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ContractEditorForm: React.FC<ContractEditorFormProps> = ({
  form,
  setForm,
  leads,
  members,
  onCancel,
  onSubmit
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">
            {form.id ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
          </h2>
          <p className="text-zinc-550 text-[10px] uppercase tracking-wider">Redacción formal y asignación de clientes/socios</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Tipo de Contrato</label>
            <select
              value={form.tipoContrato}
              onChange={e => setForm({ ...form, tipoContrato: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Cliente">Cliente / Externo</option>
              <option value="Trabajo">Contrato de Trabajo / Equipo</option>
              <option value="Socios">Acuerdo de Socios / Co-founding</option>
              <option value="General">Acuerdo General / Institucional</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título del Contrato</label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Contrato de Desarrollo E-Commerce"
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Target Selectors */}
        {form.tipoContrato === 'Cliente' ? (
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Cliente Asociado</label>
            <select
              disabled={!!form.id}
              value={form.clienteId}
              onChange={e => setForm({ ...form, clienteId: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="">Selecciona un cliente...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.nombre} ({lead.email || 'Sin correo'})
                </option>
              ))}
            </select>
          </div>
        ) : (form.tipoContrato === 'Trabajo' || form.tipoContrato === 'Socios') ? (
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Miembros / Socios Participantes</label>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-[150px] overflow-y-auto neon-scrollbar grid grid-cols-1 md:grid-cols-2 gap-2">
              {members.map(m => {
                const userId = m.usuario_id || m.usuarioId || m.usuario?.id;
                const userFullName = m.usuario?.nombreCompleto || m.usuario?.nombre_completo || m.usuario?.nombre || 'Miembro';
                const email = m.usuario?.email || '';
                const isSelected = form.miembrosIds.includes(userId);
                return (
                  <label key={userId} className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300 hover:text-white p-2 hover:bg-zinc-950 rounded-lg">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const nextMembers = isSelected 
                          ? form.miembrosIds.filter((id: string) => id !== userId)
                          : [...form.miembrosIds, userId];
                        setForm({ ...form, miembrosIds: nextMembers });
                      }}
                      className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <div>
                      <span className="font-bold block text-zinc-350">
                        {userFullName} {m.usuario?.nombre_usuario || m.usuario?.nombreUsuario ? `(@${m.usuario?.nombre_usuario || m.usuario?.nombreUsuario})` : ''}
                      </span>
                      <span className="text-[9px] text-zinc-550">{email}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Contenido de la Propuesta / Contrato</label>
          <textarea
            rows={15}
            value={form.contenido}
            onChange={e => setForm({ ...form, contenido: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-850 text-zinc-300 rounded-xl text-xs font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold"
          >
            Guardar Contrato
          </button>
        </div>
      </form>
    </div>
  );
};
