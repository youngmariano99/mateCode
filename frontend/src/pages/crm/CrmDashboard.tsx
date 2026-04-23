import React, { useState, useEffect } from 'react';
import { LeadInbox } from '../../components/crm/LeadInbox';
import { LeadCaptureModule } from '../../components/crm/LeadCaptureModule';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import { Users, Filter } from 'lucide-react';

interface Client {
  id: string;
  nombre: string;
  email: string;
}

export default function CrmDashboard() {
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
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER ESTRATÉGICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">CRM & <span className="text-blue-500">Growth</span></h1>
            <p className="text-zinc-500 font-medium mt-2">Gestioná tu embudo de ventas y calificá prospectos con BANT.</p>
        </div>
        <div className="flex gap-2">
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-2">
                <Users size={16} className="text-zinc-600" />
                <span className="text-xs font-black text-zinc-300 uppercase italic">{clients.length} Clientes Activos</span>
            </div>
        </div>
      </header>

      {/* MÓDULO DE CAPTURA (LINK MÁGICO) */}
      <LeadCaptureModule />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        
        {/* BANDEJA DE ENTRADA (PROSPECTOS) */}
        <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black text-white italic uppercase tracking-widest flex items-center gap-3">
                    <Filter className="text-blue-500" size={20} />
                    Prospectos por Calificar
                </h2>
            </div>
            <LeadInbox />
        </div>

        {/* CARTERA DE CLIENTES (APROBADOS) */}
        <aside className="space-y-6">
            <h2 className="text-lg font-black text-white italic uppercase tracking-widest px-2">Cartera de Clientes</h2>
            <div className="space-y-4">
                {clients.map(client => (
                  <div key={client.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-[10px] font-black text-zinc-500">
                      {client.nombre.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-black text-white text-xs block uppercase tracking-tight italic">{client.nombre}</span>
                      <span className="text-[10px] text-zinc-600 font-mono block mt-1">{client.email}</span>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="p-10 text-center border border-dashed border-zinc-800 rounded-3xl">
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">Sin clientes activos</p>
                  </div>
                )}
            </div>
        </aside>

      </div>
    </div>
  );
}
