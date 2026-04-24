import React, { useState, useEffect } from 'react';
import { Plus, X, Shield, Cpu, Zap, Layout, TestTube, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../../lib/apiClient';

interface Estandar {
  id: string;
  categoria: string;
  nombre: string;
  descripcionDidactica: string;
  colorHex: string;
  espacioTrabajoId?: string;
  activo?: boolean;
}

interface Props {
  projectId: string;
}

const ArchitectureBlueprint: React.FC<Props> = ({ projectId }) => {
  const [catalogo, setCatalogo] = useState<Estandar[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlueprint = async () => {
    try {
      const [catData, projData] = await Promise.all([
        api.get('/Standard'),
        api.get(`/Project/${projectId}/standards`)
      ]);

      const fullList = [...catData];
      projData.forEach((ps: any) => {
        if (!fullList.some(c => c.id === ps.id)) {
          fullList.push({ ...ps, activo: false });
        }
      });

      setCatalogo(fullList);
      setSeleccionados(projData.map((p: any) => p.id));
    } catch (error) {
      console.error("Error cargando blueprint:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchBlueprint();
    }
  }, [projectId]);

  const handleToggle = async (standardId: string) => {
    try {
      // El backend espera un Guid directo en el body ([FromBody] Guid standardId), no un objeto.
      const data = await api.post(`/Project/${projectId}/standards/toggle`, standardId);
      
      if (data.active) {
        setSeleccionados(prev => [...prev, standardId]);
      } else {
        setSeleccionados(prev => prev.filter(id => id !== standardId));
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estándar',
        icon: 'error',
        background: '#18181b',
        color: '#f4f4f5'
      });
    }
  };

  const handleCreate = async (categoria: string) => {
    const { value: formValues } = await Swal.fire({
      title: `Nuevo estándar: ${categoria}`,
      html:
        '<input id="swal-input1" class="swal2-input bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="Nombre (Ej: JWT ECC)">' +
        '<input id="swal-input2" class="swal2-input bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="Descripción didáctica (Tooltip)">',
      focusConfirm: false,
      background: '#18181b',
      color: '#f4f4f5',
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Crear Pastilla',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const descripcion = (document.getElementById('swal-input2') as HTMLInputElement).value;
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
        }
        return { nombre, descripcion };
      }
    });

    if (formValues) {
      try {
        await api.post('/Standard', {
          categoria,
          nombre: formValues.nombre,
          descripcionDidactica: formValues.descripcion,
          colorHex: '#10B981'
        });
        
        await fetchBlueprint();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Estándar creado',
          showConfirmButton: false,
          timer: 3000,
          background: '#27272a',
          color: '#f4f4f5'
        });
      } catch (error) {
        Swal.fire('Error', 'No se pudo crear el estándar', 'error');
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: '¿Eliminar estándar?',
      text: "Esta acción lo quitará del catálogo de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Sí, eliminar',
      background: '#18181b',
      color: '#f4f4f5'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/Standard/${id}`);
        await fetchBlueprint();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const categoriasUnicas = Array.from(new Set(catalogo.map(c => c.categoria))).sort();

  const getIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'seguridad': return <Shield className="w-4 h-4" />;
      case 'arquitectura': return <Cpu className="w-4 h-4" />;
      case 'testing': return <TestTube className="w-4 h-4" />;
      case 'ux/ui': return <Layout className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-zinc-500 font-medium animate-pulse">Cargando Blueprint...</p>
    </div>
  );

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Shield className="text-emerald-500 w-6 h-6" />
            </div>
            Architectural Blueprint
          </h2>
          <p className="text-zinc-500 text-sm mt-1 ml-12">
            Define las reglas que la IA debe respetar al generar código.
          </p>
        </div>
        <div className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sprint 5 - Refinamiento</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriasUnicas.map(cat => (
          <div key={cat} className="group bg-zinc-800/30 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-3">
              <div className="flex items-center gap-2 text-zinc-300 font-bold text-sm tracking-wide uppercase">
                <span className="text-emerald-500/70">{getIcon(cat)}</span>
                {cat}
              </div>
              <button 
                onClick={() => handleCreate(cat)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all shadow-lg"
                title="Nuevo estándar"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {catalogo.filter(e => e.categoria === cat).map(estandar => {
                const isSelected = seleccionados.includes(estandar.id);
                const isCustom = !!estandar.espacioTrabajoId;

                return (
                  <div
                    key={estandar.id}
                    onClick={() => handleToggle(estandar.id)}
                    title={estandar.descripcionDidactica}
                    style={{ 
                      borderColor: isSelected ? estandar.colorHex : 'transparent',
                    }}
                    className={`
                      group/pill relative cursor-pointer flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all duration-300
                      ${isSelected 
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' 
                        : 'bg-zinc-800/50 text-zinc-500 border-transparent hover:bg-zinc-700/50 hover:text-zinc-300'}
                    `}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span className={`text-xs font-semibold ${!estandar.activo && estandar.activo !== undefined ? 'opacity-60 italic' : ''}`}>
                      {estandar.nombre} {!estandar.activo && estandar.activo !== undefined && '(Legacy)'}
                    </span>
                    
                    {isCustom && estandar.activo !== false && (
                      <X 
                        onClick={(e) => handleDelete(e, estandar.id)}
                        className="w-3 h-3 text-zinc-600 hover:text-red-500 opacity-0 group-hover/pill:opacity-100 transition-opacity ml-1" 
                      />
                    )}
                  </div>
                );
              })}
              {catalogo.filter(e => e.categoria === cat).length === 0 && (
                <p className="text-[10px] text-zinc-600 italic py-2">Sin estándares definidos.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 pt-6 border-t border-zinc-800/50 flex items-center gap-4 text-zinc-500">
        <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
        <p className="text-xs italic leading-relaxed">
          TIP: Los estándares seleccionados (en verde) se inyectan automáticamente en el <span className="text-zinc-300 font-bold">Motor de Prompts</span>. 
          Pasa el mouse sobre cada uno para ver su descripción técnica.
        </p>
      </div>
    </div>
  );
};

export default ArchitectureBlueprint;
