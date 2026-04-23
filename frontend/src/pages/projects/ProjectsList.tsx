import React, { useEffect, useState } from 'react';
import { Rocket, Clock, ArrowRight, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

interface Proyecto {
  id: string;
  nombre: string;
  estado: string;
  fechaCreacion: string;
}

export default function ProjectsList() {
  const { tenantId } = useProject();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await api.get('/Project');
      setProyectos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchProjects();
  }, [tenantId]);

  const handleCreateProject = async () => {
    try {
      // Cargamos plantillas disponibles
      const templates = await api.get('/Stack/templates').catch(() => []);

      const { value: formValues } = await Swal.fire({
        title: 'Nuevo Proyecto',
        background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
        html: `
            <div class="text-left space-y-4">
                <label class="block text-xs font-black uppercase text-zinc-500 mb-2">Nombre del Proyecto</label>
                <input id="proj-name" class="swal2-input w-full bg-zinc-950 border-zinc-800 text-white rounded-xl m-0" placeholder="Ej: Nexus Platform">
                
                <label class="block text-xs font-black uppercase text-zinc-500 mb-2 mt-6">Plantilla de Arranque (Bóveda)</label>
                <select id="proj-template" class="swal2-input w-full bg-zinc-950 border-zinc-800 text-white rounded-xl m-0">
                    <option value="">Proyecto en blanco</option>
                    ${templates.map((t: any) => `<option value="${t.id}">${t.nombre}</option>`).join('')}
                </select>
            </div>
        `,
        focusConfirm: false,
        preConfirm: () => {
          return {
            nombre: (document.getElementById('proj-name') as HTMLInputElement).value,
            plantillaId: (document.getElementById('proj-template') as HTMLSelectElement).value
          }
        }
      });

      if (formValues && formValues.nombre) {
        await api.post('/Project', { 
            Nombre: formValues.nombre,
            PlantillaStackId: formValues.plantillaId || null
        });

        Swal.fire({ icon: 'success', title: '¡Proyecto Creado!', text: 'Con el stack de la bóveda cargado.', timer: 2000, showConfirmButton: false, background: '#18181b', color: '#fff' });
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
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Taller de <span className="text-emerald-500">Proyectos</span></h1>
          <p className="text-zinc-500 font-medium leading-relaxed max-w-lg">Gestioná tus desarrollos activos y avanzá a través de la metodología MateCode.</p>
        </div>
        <button
          onClick={handleCreateProject}
          className="px-8 py-4 bg-emerald-500 text-zinc-950 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3"
        >
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {proyectos.map((proy) => (
          <div key={proy.id} className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[2.5rem] p-8 group hover:border-emerald-500/30 transition-all relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                <Rocket size={120} className="text-zinc-700" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all duration-500">
                        <Rocket size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                        {new Date(proy.fechaCreacion).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2 group-hover:text-emerald-400 transition-colors">{proy.nombre}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-emerald-500" />
                    {proy.estado}
                </p>
            </div>

            <Link
              to={`/projects/${proy.id}`}
              className="mt-12 w-full py-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 group/btn overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">Entrar al Taller</span>
              <ArrowRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}

        <button
          onClick={handleCreateProject}
          className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:bg-zinc-900/30 transition-all group min-h-[300px]"
        >
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-600 group-hover:bg-emerald-500 group-hover:text-zinc-950 group-hover:border-emerald-500 transition-all">
            <Plus size={32} />
          </div>
          <div className="space-y-1">
            <p className="font-black text-white italic uppercase tracking-widest text-sm">Empezar de cero</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">¿Tenés una nueva idea?</p>
          </div>
        </button>
      </div>
    </div>
  );
}
