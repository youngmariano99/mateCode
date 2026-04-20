import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import Swal from 'sweetalert2';

interface Lead {
  id: string;
  nombre: string;
  email: string;
  estado: string;
}

export const LeadInbox = () => {
  const { tenantId } = useProject();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5241/api/Crm/leads', {
        headers: { 'X-Tenant-Id': tenantId }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
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
    try {
      const response = await fetch(`http://localhost:5241/api/Crm/leads/${id}/approve`, {
        method: 'POST',
        headers: { 'X-Tenant-Id': tenantId }
      });

      if (response.ok) {
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Lead convertido a Cliente y Proyecto creado.',
          icon: 'success',
          background: '#18181b',
          color: '#f4f4f5',
          confirmButtonColor: '#10b981'
        });
        fetchLeads();
      } else {
        throw new Error('No se pudo aprobar el lead');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al procesar la aprobación.',
        icon: 'error',
        background: '#18181b',
        color: '#f4f4f5'
      });
    }
  };

  if (loading) return <div className="text-center py-8 text-slate-500">Cargando bandeja de entrada...</div>;

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">No hay Leads nuevos en bandeja. ¡Compartí el link del formulario!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map(lead => (
        <div key={lead.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">Nuevo</span>
              <p className="font-medium text-slate-900 dark:text-white">{lead.email}</p>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Interesado: {lead.nombre}</p>
          </div>
          <div className="shrink-0 space-x-2">
            <button className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition cursor-pointer">
              Rechazar
            </button>
            <button 
              onClick={() => handleAprobar(lead.id)}
              className="px-3 py-1.5 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition cursor-pointer">
              Aprobar y Crear Proyecto
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
