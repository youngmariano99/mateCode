import React, { useEffect, useState } from 'react';
import { Rocket, Clock, ArrowRight, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

interface Proyecto {
  id: string;
  nombre: string;
  cliente?: string;
  estado: string;
  fechaCreacion: string;
}

export default function ProjectsList() {
  const { tenantId } = useProject();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

  const fetchProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE}/api/Project`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'X-Tenant-Id': tenantId || ''
        }
      });
      if (!response.ok) throw new Error("Error al traer proyectos");
      const data = await response.json();
      setProyectos(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Se nos lavó el mate',
        text: 'No pudimos cargar tus proyectos. Intentá de nuevo más tarde.',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#10b981'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchProjects();
  }, [tenantId]);

  const handleCreateProject = async () => {
    try {
      const { value: name } = await Swal.fire({
        title: 'Nuevo Proyecto',
        input: 'text',
        inputLabel: '¿Cómo se llama la idea?',
        inputPlaceholder: 'Ej: App de Delivery',
        showCancelButton: true,
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#3f3f46',
        inputValidator: (value) => {
          if (!value) return '¡Necesito un nombre para arrancar!';
          return null;
        }
      });

      if (name) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE}/api/Project`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'X-Tenant-Id': tenantId || ''
          },
          body: JSON.stringify({ Nombre: name })
        });

        if (!response.ok) throw new Error("Error al crear");

        Swal.fire({
          icon: 'success',
          title: '¡Proyecto Creado!',
          text: 'Ya podés entrar al taller a darle forma.',
          timer: 2000,
          showConfirmButton: false,
          background: '#18181b',
          color: '#fff'
        });

        fetchProjects();
      }
    } catch (err) {
      Swal.fire('Error', 'No se pudo crear el proyecto', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Mis Proyectos</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Gestioná tus desarrollos activos y avanzá a través de las fases de ingeniería.
          </p>
        </div>
        <button
          onClick={handleCreateProject}
          className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-md hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectos.map((proy) => (
          <div key={proy.id} className="glass-card p-6 group hover:border-emerald-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
                <Rocket size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {new Date(proy.fechaCreacion).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">{proy.nombre}</h3>
            <p className="text-xs text-zinc-500 mb-6 flex items-center gap-1">
              <Clock size={12} />
              {proy.estado}
            </p>

            <Link
              to={`/projects/${proy.id}/phase-0-feasibility`}
              className="w-full py-3 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-emerald-500 hover:text-white text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2"
            >
              Entrar al Taller
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}

        {/* Card para crear uno nuevo */}
        <div
          onClick={handleCreateProject}
          className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer group"
        >
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <Plus size={24} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-zinc-900 dark:text-zinc-200">Empezar de cero</p>
            <p className="text-xs text-zinc-500">¿Tenés una nueva idea?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
