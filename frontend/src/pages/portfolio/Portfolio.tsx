import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { Rocket, Plus, ExternalLink, Calendar } from 'lucide-react';

interface PortfolioProject {
  id: string;
  nombre: string;
  fechaCreacion: string;
  stack: string;
}

export default function Portfolio() {
  const { tenantId } = useProject();
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const data = await api.get('/Portfolio');
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [tenantId]);

  const handleExpressImport = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Importación Express 🚀',
      html:
        '<input id="swal-input1" class="swal2-input bg-zinc-900 border-zinc-700 text-white" placeholder="Nombre del Proyecto">' +
        '<input id="swal-input2" class="swal2-input bg-zinc-900 border-zinc-700 text-white" placeholder="Tecnologías (Ej: React, Node, SQL)">',
      focusConfirm: false,
      background: '#18181b',
      color: '#f4f4f5',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Importar Ahora',
      showCancelButton: true,
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const stack = (document.getElementById('swal-input2') as HTMLInputElement).value;
        if (!nombre || !stack) {
          Swal.showValidationMessage('Por favor completa ambos campos');
        }
        return { nombre, stack };
      }
    });

    if (formValues) {
      try {
        await api.post('/Portfolio/express', { 
          Nombre: formValues.nombre, 
          Stack: formValues.stack 
        });

        Swal.fire({
          title: '¡Proyecto Importado!',
          text: 'Se ha añadido a tu portfolio como "Finalizado".',
          icon: 'success',
          background: '#18181b',
          color: '#f4f4f5'
        });
        fetchPortfolio();
      } catch (error) {
        console.error('Error in express import:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Portfolio & Casos de Éxito <Rocket className="text-indigo-500" />
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Vitrina de proyectos finalizados listos para exportar a tu web personal.
          </p>
        </div>
        <button 
          onClick={handleExpressImport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 cursor-pointer">
          <Plus className="h-4 w-4" /> Importación Express
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Cargando tus éxitos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portfolio.map((project) => (
            <div key={project.id} className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition hover:shadow-xl dark:hover:border-indigo-500/30 group">
              <div className="aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
                <Rocket className="h-12 w-12 text-slate-300 dark:text-slate-700 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl">{project.nombre}</h3>
                  <ExternalLink className="h-5 w-5 text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> 
                    {new Date(project.fechaCreacion).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase rounded">
                    {project.stack}
                  </span>
                </div>
                <div className="flex gap-2">
                   <button className="flex-1 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                     Ver Detalles
                   </button>
                   <button className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition">
                     JSON API
                   </button>
                </div>
              </div>
            </div>
          ))}

          {portfolio.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-slate-500 text-lg mb-2">Tu portfolio está vacío.</p>
              <p className="text-slate-500 text-sm">Usá la Importación Express o finalizá un proyecto para que aparezca aquí.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
