import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import { ChevronDown, Plus, Briefcase, Check } from 'lucide-react';

interface Workspace {
  id: string;
  nombre: string;
}

export const WorkspaceSelector = () => {
  const { tenantId, setTenant } = useProject();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

  const fetchWorkspaces = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // AGREGAR ESTA VALIDACIÓN: Si no hay token, no hacemos la petición
      if (!session?.access_token) {
        console.warn("No hay sesión activa de Supabase todavía.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/Workspace`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      } else {
        console.error("Error del backend:", response.status);
      }
    } catch (err) {
      console.error("Error fetching workspaces", err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async () => {
    const { value: name } = await Swal.fire({
      title: 'Nuevo Espacio de Trabajo',
      input: 'text',
      inputLabel: 'Nombre del espacio',
      inputPlaceholder: 'Ej: AppyStudios v2',
      showCancelButton: true,
      background: '#18181b',
      color: '#f4f4f5',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Crear Espacio',
      cancelButtonText: 'Cancelar'
    });

    if (name) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE}/api/Workspace`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ Nombre: name })
        });

        if (response.ok) {
          const newWs = await response.json();
          await fetchWorkspaces();
          setTenant(newWs.id);
          Swal.fire({
            title: '¡Espacio Creado!',
            text: `Ya estás trabajando en ${name}`,
            icon: 'success',
            background: '#18181b',
            color: '#f4f4f5'
          });
        }
      } catch (err) {
        console.error("Error creating workspace", err);
      }
    }
  };

  const currentWorkspace = workspaces.find(w => w.id === tenantId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-200"
      >
        <Briefcase size={14} className="text-zinc-400" />
        <span className="max-w-[120px] truncate">{currentWorkspace?.nombre || 'MateCode Default'}</span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 py-2">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
              Mis Espacios
            </div>

            <div className="max-h-64 overflow-y-auto">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setTenant(ws.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <span className={tenantId === ws.id ? 'text-emerald-500 font-semibold' : ''}>
                    {ws.nombre}
                  </span>
                  {tenantId === ws.id && <Check size={14} className="text-emerald-500" />}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 mt-2 pt-2 px-2">
              <button
                onClick={handleCreateWorkspace}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors font-medium"
              >
                <Plus size={14} />
                Nuevo Espacio
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
