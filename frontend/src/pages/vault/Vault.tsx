import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import Swal from 'sweetalert2';
import { Trash2, ShieldCheck, Cpu } from 'lucide-react';

interface Template {
  id: string;
  nombre: string;
  payloadTecnico: any;
}

export default function Vault() {
  const { tenantId } = useProject();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5241/api/Vault/templates', {
        headers: { 'X-Tenant-Id': tenantId }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching vault templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [tenantId]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Confirmás la eliminación?',
      text: "Esta plantilla desaparecerá de tu Bóveda permanente.",
      icon: 'warning',
      showCancelButton: true,
      background: '#18181b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5241/api/Vault/templates/${id}`, {
          method: 'DELETE',
          headers: { 'X-Tenant-Id': tenantId }
        });

        if (response.ok) {
          Swal.fire({
            title: '¡Eliminado!',
            text: 'La plantilla ha sido removida.',
            icon: 'success',
            background: '#18181b',
            color: '#f4f4f5'
          });
          fetchTemplates();
        }
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            La Bóveda <ShieldCheck className="text-emerald-500" />
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Módulos resguardados, stacks tecnológicos reutilizables y activos de proyectos exitosos.
          </p>
        </div>
        <div className="flex gap-4">
          <a href="/app/vault/prompts" className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-bold hover:bg-zinc-700 transition-all">
            📜 Biblioteca de Prompts
          </a>
          <a href="/app/vault/forms" className="px-4 py-2 bg-emerald-500 text-zinc-950 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
            📝 Biblioteca de Formularios
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Sincronizando con la Bóveda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="group p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Cpu className="h-6 w-6 text-emerald-500" />
                </div>
                <button 
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{template.nombre}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                Stack configurado listo para inyectar en nuevos prompts de Fase 2.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 rounded">
                  Reusable
                </span>
                <span className="px-2 py-1 bg-indigo-500/10 text-[10px] font-bold uppercase tracking-wider text-indigo-500 rounded">
                  Full Stack
                </span>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-slate-500">Aún no has guardado plantillas. Podrás hacerlo al finalizar la Fase 2 de tus proyectos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
