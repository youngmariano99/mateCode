import React, { useState, useEffect } from 'react';
import { Plus, X, Shield, Cpu, Zap, Layout, TestTube, Check, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../../lib/apiClient';
import { useProjectBlueprintStore } from '../../../store/useProjectBlueprintStore';

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

// Mapa de Categorías por Niveles (Sugerencia del usuario)
const NIVELES = {
    'Técnicos': ['Código', 'Arquitectura', 'Seguridad', 'Infraestructura'],
    'Operativos': ['Procesos', 'Testing', 'Documentación', 'DevOps', 'Gestión de requisitos'],
    'Estratégicos': ['UX/UI', 'Accesibilidad', 'Compliance', 'Mantenimiento', 'Legal']
};

const ArchitectureBlueprint: React.FC<Props> = ({ projectId }) => {
  const [groupedCatalog, setGroupedCatalog] = useState<{ actual: any[], sinAsociar: any[], otrosProyectos: any[] }>({ actual: [], sinAsociar: [], otrosProyectos: [] });
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { pendingStandardsImport, setPendingStandardsImport } = useProjectBlueprintStore();

  const fetchBlueprint = async () => {
    try {
      const groupedData = await api.get(`/Standard/grouped?currentProjectId=${projectId}`);
      setGroupedCatalog({
        actual: groupedData.actual || [],
        sinAsociar: groupedData.sinAsociar || [],
        otrosProyectos: groupedData.otrosProyectos || []
      });

      const flatList = [...(groupedData.actual || []), ...(groupedData.sinAsociar || [])];
      (groupedData.otrosProyectos || []).forEach((op: any) => {
         flatList.push(...op.estandares);
      });
      
      const uniqueFlat = Array.from(new Map(flatList.map(item => [item.id, item])).values());
      setCatalogo(uniqueFlat);
      setSeleccionados((groupedData.actual || []).map((s:any) => s.id));
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

  // SMART IMPORT EFFECT
  useEffect(() => {
    if (pendingStandardsImport && !loading) {
        processAIInjection(pendingStandardsImport);
        setPendingStandardsImport(null);
    }
  }, [pendingStandardsImport, loading]);

  const processAIInjection = async (aiStandards: any[]) => {
    const newItems: any[] = [];
    const alreadyExists: string[] = [];

    aiStandards.forEach(ai => {
        // Normalización básica para deduplicación
        const normalizedAiName = ai.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const exists = catalogo.find(c => {
            const normalizedCatName = c.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedCatName === normalizedAiName || 
                   normalizedCatName.includes(normalizedAiName) || 
                   normalizedAiName.includes(normalizedCatName);
        });

        if (exists) {
            alreadyExists.push(ai.nombre);
        } else {
            newItems.push(ai);
        }
    });

    if (newItems.length === 0) {
        Swal.fire({ title: 'Blueprint al día', text: 'Todos los estándares sugeridos ya existen en tu catálogo.', icon: 'info', background: '#18181b', color: '#fff' });
        return;
    }

    const { isConfirmed } = await Swal.fire({
        title: 'Sugerencias de Calidad',
        html: `
            <div class="text-left text-sm space-y-4">
                <p>La IA ha detectado <span class="text-emerald-400 font-bold">${newItems.length} nuevos estándares</span> para tu proyecto.</p>
                ${alreadyExists.length > 0 ? `<p class="text-zinc-500 text-[10px]">Omitiendo ${alreadyExists.length} similares: ${alreadyExists.slice(0,3).join(', ')}...</p>` : ''}
                <div class="max-h-48 overflow-y-auto bg-black/20 p-4 rounded-xl border border-zinc-800 space-y-2">
                    ${newItems.map(n => `<div class="flex items-center gap-2 text-xs text-zinc-300">
                        <div class="w-1.5 h-1.5 rounded-full" style="background: ${n.color || '#10b981'}"></div>
                        <b class="uppercase text-emerald-500">${n.categoria}:</b> ${n.nombre}
                    </div>`).join('')}
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Inyectar Blueprint',
        confirmButtonColor: '#10b981',
        cancelButtonText: 'Cancelar',
        background: '#18181b', color: '#fff'
    });

    if (isConfirmed) {
        try {
            for (const item of newItems) {
                // 1. Crear en el catálogo
                const created = await api.post('/Standard', {
                    categoria: item.categoria,
                    nombre: item.nombre,
                    descripcionDidactica: item.descripcion,
                    colorHex: item.color || '#10b981'
                });

                // 2. Activar para el proyecto
                await api.post(`/Project/${projectId}/standards/toggle`, created.id);
            }
            await fetchBlueprint();
            Swal.fire({ icon: 'success', title: 'Blueprint Consolidado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        } catch (err) {
            Swal.fire('Error', 'Hubo un problema al inyectar algunos estándares.', 'error');
        }
    }
  };

  const handleToggle = async (standardId: string) => {
    try {
      const data = await api.post(`/Project/${projectId}/standards/toggle`, standardId);
      if (data.active) {
        setSeleccionados(prev => [...prev, standardId]);
      } else {
        setSeleccionados(prev => prev.filter(id => id !== standardId));
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo actualizar el estándar', icon: 'error', background: '#18181b', color: '#f4f4f5' });
    }
  };

  const handleCreate = async (categoria: string) => {
    const { value: formValues } = await Swal.fire({
      title: `Nuevo estándar: ${categoria}`,
      html:
        '<input id="swal-input1" class="swal2-input bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="Nombre (Ej: JWT ECC)">' +
        '<input id="swal-input2" class="swal2-input bg-zinc-900 border-zinc-700 text-zinc-100" placeholder="Descripción didáctica (Tooltip)">',
      focusConfirm: false,
      background: '#18181b', color: '#f4f4f5', confirmButtonColor: '#10B981', confirmButtonText: 'Crear Pastilla',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const descripcion = (document.getElementById('swal-input2') as HTMLInputElement).value;
        if (!nombre) Swal.showValidationMessage('El nombre es obligatorio');
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
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Estándar creado', showConfirmButton: false, timer: 3000, background: '#27272a', color: '#f4f4f5' });
      } catch (error) { Swal.fire('Error', 'No se pudo crear el estándar', 'error'); }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: '¿Eliminar estándar?',
      text: "Esta acción lo quitará del catálogo de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', cancelButtonColor: '#3f3f46', confirmButtonText: 'Sí, eliminar',
      background: '#18181b', color: '#f4f4f5'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/Standard/${id}`);
        await fetchBlueprint();
      } catch (error) { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
    }
  };

  const getIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('seguridad')) return <Shield className="w-4 h-4" />;
    if (c.includes('arquitectura') || c.includes('técnico')) return <Cpu className="w-4 h-4" />;
    if (c.includes('testing') || c.includes('qa')) return <TestTube className="w-4 h-4" />;
    if (c.includes('ux') || c.includes('diseño') || c.includes('layout')) return <Layout className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const categoriasUnicas = Array.from(new Set(catalogo.map(c => c.categoria))).sort();

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-zinc-500 font-medium animate-pulse">Cargando Blueprint...</p>
    </div>
  );

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-10 backdrop-blur-sm shadow-2xl space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4 leading-none">
            Architectural <span className="text-emerald-500">Blueprint</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-3 ml-1">
            Reglas de juego y estándares de calidad para el Motor de Prompts.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
              onClick={() => handleCreate("Personalizado")}
              className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
              <Plus size={14} /> Nuevo Estándar
          </button>
          <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-inner hidden md:block">
            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Nivel de Madurez: Phase 0</span>
          </div>
        </div>
      </header>

      {/* RENDER AGRUPADO POR PROYECTO */}
      {(() => {
          const renderStandardGroup = (title: string, standards: any[], icon: React.ReactNode, isEmptyMsg: string) => {
              if (standards.length === 0) return (
                  <div className="flex items-center gap-3 p-4 bg-zinc-950/40 border border-zinc-800/60 rounded-2xl text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {isEmptyMsg}
                  </div>
              );

              // Agrupar por categoría
              const porCategoria = standards.reduce((acc, estandar) => {
                  acc[estandar.categoria] = acc[estandar.categoria] || [];
                  acc[estandar.categoria].push(estandar);
                  return acc;
              }, {} as Record<string, any[]>);

              return (
                  <div className="space-y-6">
                      <div className="flex items-center gap-4">
                          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-2">
                              {icon} {title}
                          </h3>
                          <div className="h-px flex-1 bg-zinc-800/50" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Object.entries(porCategoria).map(([cat, items]: [string, any]) => (
                              <div key={cat} className="group bg-zinc-950/40 border border-zinc-800/60 rounded-[2.5rem] p-6 hover:border-emerald-500/20 transition-all duration-300">
                                  <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
                                      <div className="flex items-center gap-3 text-zinc-400 font-black text-[10px] uppercase tracking-widest">
                                          <span className="text-emerald-500/70 p-2 bg-zinc-900 rounded-xl shadow-inner">{getIcon(cat)}</span>
                                          {cat}
                                      </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                      {items.map((estandar: any) => {
                                          const isSelected = seleccionados.includes(estandar.id);
                                          const isCustom = !!estandar.espacioTrabajoId;
                                          return (
                                              <div
                                                  key={estandar.id}
                                                  onClick={() => handleToggle(estandar.id)}
                                                  title={estandar.descripcionDidactica}
                                                  className={`group/pill relative cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isSelected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900/50 text-zinc-600 border-transparent hover:bg-zinc-800/50 hover:text-zinc-300'}`}
                                              >
                                                  {isSelected && <Check size={12} strokeWidth={4} />}
                                                  <span className={`text-[10px] font-black uppercase tracking-tighter ${!estandar.activo && estandar.activo !== undefined ? 'opacity-60 italic line-through' : ''}`}>
                                                      {estandar.nombre}
                                                  </span>
                                                  {isCustom && estandar.activo !== false && (
                                                      <X onClick={(e) => handleDelete(e, estandar.id)} className="w-3 h-3 text-zinc-700 hover:text-red-500 opacity-0 group-hover/pill:opacity-100 transition-opacity ml-1" />
                                                  )}
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          };

          return (
              <div className="space-y-12">
                  {renderStandardGroup("Estándares del Proyecto Actual", groupedCatalog.actual, <Shield className="w-4 h-4 text-emerald-500" />, "No hay estándares seleccionados en este proyecto aún.")}
                  
                  {renderStandardGroup("Disponibles (Sin Asociar)", groupedCatalog.sinAsociar, <Layers className="w-4 h-4 text-blue-500" />, "No hay estándares huérfanos.")}

                  {groupedCatalog.otrosProyectos.length > 0 && (
                      <div className="space-y-8 mt-12 pt-8 border-t border-zinc-800/50">
                          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Estándares en Otros Proyectos</h3>
                          {groupedCatalog.otrosProyectos.map((grupo: any) => (
                              <div key={grupo.proyectoId} className="pl-4 border-l-2 border-zinc-800/50">
                                  {renderStandardGroup(`Proyecto: ${grupo.proyectoNombre}`, grupo.estandares, <Layout className="w-4 h-4 text-zinc-500" />, "Sin estándares")}
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          );
      })()}
      
      <footer className="mt-12 pt-10 border-t border-zinc-800/50 flex items-center gap-6">
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Zap size={24} className="text-amber-500" />
        </div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
            Los estándares seleccionados en <span className="text-emerald-500 italic">verde esmeralda</span> definen la personalidad técnica del proyecto y guían las decisiones de la IA en fases posteriores.
        </p>
      </footer>
    </div>
  );
};

export default ArchitectureBlueprint;
