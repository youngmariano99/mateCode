import React, { useState, useEffect } from 'react';
import { LeadInbox } from '../../components/crm/LeadInbox';
import { useProject } from '../../context/ProjectContext';

interface Client {
  id: string;
  nombre: string;
  email: string;
}

export default function CrmDashboard() {
  const { tenantId } = useProject();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!tenantId) return;
      try {
        const response = await fetch('http://localhost:5241/api/Crm/clients', { 
          headers: { 'X-Tenant-Id': tenantId }
        });
        if (response.ok) {
           const data = await response.json();
           setClients(data);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, [tenantId]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM & Ventas</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Aprobá prospectos entrantes para convertirlos mágicamente en proyectos y clientes.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Bandeja de Entrada (Nuevos Leads)
        </h2>
        <LeadInbox />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Clientes Activos (Aprobados)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {clients.map(client => (
             <div key={client.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
               <span className="font-semibold text-slate-900 dark:text-white block">{client.nombre}</span>
               <span className="text-sm text-slate-500 dark:text-slate-400">{client.email}</span>
             </div>
           ))}
           {clients.length === 0 && (
             <p className="text-slate-500 text-sm italic">Todavía no tenés clientes aprobados.</p>
           )}
        </div>
      </section>
    </div>
  );
}
