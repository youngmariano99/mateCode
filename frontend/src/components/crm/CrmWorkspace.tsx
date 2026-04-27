import React, { useState, useEffect } from 'react';
import { LeadInbox } from './LeadInbox';
import { LeadCaptureModule } from './LeadCaptureModule';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import { Users, Filter, Sparkles, Layout } from 'lucide-react';

interface Client {
  id: string;
  nombre: string;
  email: string;
}

export const CrmWorkspace: React.FC = () => {
  const { tenantId } = useProject();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      if (!tenantId) return;
      try {
        const data = await api.get('/Crm/clients');
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [tenantId]);

  return (
    <div className="h-full flex flex-col bg-transparent text-zinc-100 overflow-hidden">
      
      {/* Header Inmersivo */}
      <div className="flex items-center justify-between p-8 bg-white/5 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner">
            <Users className="text-blue-500" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">CRM & <span className="text-blue-500">Growth Hub</span></h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <Sparkles size={12} className="text-blue-400" /> {clients.length} Clientes Activos en Cartera
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sincronización Live</span>
            </div>
        </div>
      </div>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
        
        {/* Link Mágico de Captura */}
        <div className="max-w-4xl mx-auto">
            <LeadCaptureModule />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 max-w-7xl mx-auto">
          
          {/* Bandeja de Prospectos */}
          <div className="xl:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg font-black text-white italic uppercase tracking-widest flex items-center gap-3">
                      <Filter className="text-blue-500" size={20} />
                      Bandeja de Prospectos
                  </h2>
              </div>
              <LeadInbox />
          </div>

          {/* Cartera de Clientes */}
          <aside className="space-y-8">
              <h2 className="text-lg font-black text-white italic uppercase tracking-widest px-2">Cartera Elite</h2>
              <div className="space-y-4">
                  {clients.map(client => (
                    <div key={client.id} className="p-6 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:border-blue-500/50 hover:bg-zinc-900/60 transition-all flex items-center gap-4 group cursor-pointer shadow-xl">
                      <div className="w-12 h-12 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center text-xs font-black text-zinc-500 group-hover:text-blue-400 transition-colors">
                        {client.nombre.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-black text-white text-sm block uppercase tracking-tight italic group-hover:text-blue-400 transition-colors">{client.nombre}</span>
                        <span className="text-[9px] text-zinc-600 font-mono block mt-1 tracking-widest">{client.email}</span>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && (
                    <div className="p-12 text-center border border-dashed border-white/5 rounded-[2.5rem] bg-black/20">
                      <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic opacity-50">Sin clientes activos</p>
                    </div>
                  )}
              </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
