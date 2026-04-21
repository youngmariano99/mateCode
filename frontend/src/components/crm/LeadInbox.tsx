import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import { ChevronDown, ChevronUp, Star, Rocket, Trash2, Send } from 'lucide-react';

interface Lead {
  id: string;
  nombre: string;
  email: string;
  estado: string;
  contextoJson?: any; 
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

export const LeadInbox = () => {
  const { tenantId } = useProject();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE}/api/Crm/leads`, {
        headers: { 
            'Authorization': `Bearer ${session?.access_token}`,
            'X-Tenant-Id': tenantId 
        }
      });
      if (response.ok) {
        setLeads(await response.json());
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [tenantId]);

  const handleAprobar = async (id: string) => {
    const result = await Swal.fire({
        title: '¿Convertir en Proyecto?',
        text: 'Se creará un nuevo proyecto y se asociará este cliente.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear proyecto',
        background: '#18181b', color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE}/api/Crm/leads/${id}/approve`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${session?.access_token}`,
            'X-Tenant-Id': tenantId || '' 
        }
      });

      if (response.ok) {
        Swal.fire({ title: '¡Proyecto Creado!', icon: 'success', background: '#18181b', color: '#fff' });
        fetchLeads();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-500 italic">Cargando bandeja de entrada...</div>;

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-900/50">
        <Send className="mx-auto text-zinc-800 mb-4" size={48} />
        <p className="text-zinc-500 font-medium italic">No hay Leads nuevos. Compartí tu Link Mágico para empezar a recibir requerimientos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map(lead => {
        const isExpanded = expandedLead === lead.id;
        const bData = lead.contextoJson || {};

        return (
          <div key={lead.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden transition-all hover:border-zinc-700 shadow-xl">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 font-black">
                  {lead.nombre.substring(0,2).toUpperCase()}
                </div>
                <div>
                   <div className="flex items-center gap-2">
                     <h3 className="font-black text-white text-lg tracking-tight italic uppercase">{lead.nombre}</h3>
                     <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 uppercase tracking-widest">Nuevo</span>
                   </div>
                   <p className="text-zinc-500 text-xs font-mono">{lead.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {isExpanded ? 'Cerrar Detalles' : 'Ver BANT'}
                </button>
                <button 
                  onClick={() => handleAprobar(lead.id)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Rocket size={14} /> Convertir
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-zinc-950 border border-zinc-800 rounded-[1.5rem] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Análisis de Calificación</h4>
                      {Object.entries(bData).map(([key, val]: [string, any], idx) => (
                        <div key={idx} className="border-b border-zinc-900 pb-3 last:border-0">
                           <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                           <p className="text-xs text-zinc-300 italic">{val || 'N/A'}</p>
                        </div>
                      ))}
                   </div>
                   <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-yellow-500 mb-4">
                           <Star size={16} fill="currentColor" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Scoring de Prioridad</span>
                        </div>
                        <p className="text-zinc-500 text-xs italic leading-relaxed">
                          Basado en los requerimientos, el cliente parece tener un presupuesto asignado y una ventana de implementación de 3 meses.
                        </p>
                      </div>
                      <div className="mt-6 flex justify-end gap-2">
                        <button className="p-3 bg-zinc-950 text-zinc-600 rounded-xl hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
