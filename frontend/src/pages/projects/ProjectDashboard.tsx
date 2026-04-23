import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  Dna, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Layout, 
  Kanban, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Copy,
  BrainCircuit
} from 'lucide-react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';

interface ContextSummary {
  tieneAdn: boolean;
  tieneStack: boolean;
  tieneBlueprint: boolean;
  cantidadRequisitos: number;
  diagramasGenerados: number;
  ticketsActivos: number;
  faseActual: string;
}

const ProjectDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ContextSummary | null>(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, projData] = await Promise.all([
          api.get(`/Project/${id}/context-summary`),
          api.get(`/Project/${id}`)
        ]);

        setSummary(sumData);
        setProjectName(projData.nombre);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleCopyMasterPrompt = async () => {
    try {
      const { prompt } = await api.get(`/Project/${id}/master-prompt`);

      await navigator.clipboard.writeText(prompt);

      Swal.fire({
        title: '¡Prompt Maestro Copiado!',
        text: 'El contexto global del proyecto está en tu portapapeles. Pegalo en ChatGPT, Claude o tu IA favorita.',
        icon: 'success',
        background: '#18181b',
        color: '#f4f4f5',
        confirmButtonColor: '#10b981',
        html: `
          <div class="mt-4 text-left p-4 bg-zinc-950 rounded-lg text-[10px] font-mono text-zinc-500 max-h-40 overflow-y-auto">
            ${prompt.replace(/\n/g, '<br/>')}
          </div>
        `
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo generar el prompt maestro.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  const sections = [
    {
      title: "ADN e Ingeniería",
      subtitle: "El alma de tu proyecto",
      icon: <Dna className="w-6 h-6" />,
      done: summary?.tieneAdn,
      link: `/projects/${id}/phase-0-feasibility`,
      meta: summary?.tieneAdn ? "Consolidado" : "Pendiente",
      description: "Es el mapa estratégico. Definir el problema y la visión evita que construyas algo que nadie necesita. Es tu brújula para no perderte en el camino."
    },
    {
      title: "Stack Tecnológico",
      subtitle: "Tu caja de herramientas",
      icon: <Layers className="w-6 h-6" />,
      done: summary?.tieneStack,
      link: `/projects/${id}/phase-0-feasibility?tab=stack`,
      meta: summary?.tieneStack ? "Definido" : "Sin elegir",
      description: "Elegir el stack correcto no es solo moda; es asegurar que tu app sea escalable, rápida y fácil de mantener sin dramas técnicos a futuro."
    },
    {
      title: "Architectural Blueprint",
      subtitle: "Las leyes de tu código",
      icon: <ShieldCheck className="w-6 h-6" />,
      done: summary?.tieneBlueprint,
      link: `/projects/${id}/phase-0-feasibility?tab=blueprint`,
      meta: summary?.tieneBlueprint ? "Activo" : "Sin definir",
      description: "Estandarizar la arquitectura asegura que todo el equipo hable el mismo idioma. Tu código será una obra de arte, no un plato de espagueti."
    },
    {
      title: "Requisitos y BDD",
      subtitle: "El contrato con la IA",
      icon: <FileText className="w-6 h-6" />,
      done: summary?.cantidadRequisitos > 0,
      link: `/projects/${id}/phase-1-requirements`,
      meta: `${summary?.cantidadRequisitos} Historias`,
      description: "Transformar ideas en historias claras con BDD asegura que la IA entienda exactamente qué construir y vos sepas cuándo está terminado de verdad."
    },
    {
      title: "Diseño de Sistemas",
      subtitle: "El plano antes de la obra",
      icon: <Layout className="w-6 h-6" />,
      done: summary?.diagramasGenerados > 0,
      link: `/projects/${id}/phase-2-design`,
      meta: `${summary?.diagramasGenerados} Diagramas`,
      description: "Diagramar evita sorpresas costosas. Permite que la IA genere el código base con una precisión quirúrgica, respetando tu visión arquitectónica."
    },
    {
      title: "Trinchera (Kanban)",
      subtitle: "Donde sucede la magia",
      icon: <Kanban className="w-6 h-6" />,
      done: summary?.ticketsActivos === 0 && summary?.cantidadRequisitos > 0,
      link: `/projects/${id}/phase-3-implementation`,
      meta: `${summary?.ticketsActivos} Tickets Activos`,
      description: "Gestión visual para que el equipo (y la IA) no se pise. Es el pulso real del proyecto: acá es donde las ideas se convierten en software funcional."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* HEADER SIMPLIFICADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            {projectName}
          </h1>
          <p className="text-zinc-500 mt-1 font-medium italic text-sm">
            Estado actual: {summary?.faseActual}
          </p>
        </div>

        <button 
          onClick={handleCopyMasterPrompt}
          className="group relative px-8 py-4 bg-emerald-500 text-zinc-950 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <BrainCircuit className="w-4 h-4" />
          Copiar Prompt Maestro
          <Copy className="w-3 h-3 opacity-50" />
        </button>
      </div>

      {/* GRID DE ESTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((s, idx) => (
          <div 
            key={idx}
            className={`group relative bg-zinc-900/40 border ${s.done ? 'border-emerald-500/20' : 'border-zinc-800'} rounded-[2.5rem] p-8 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden flex flex-col justify-between`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${s.done ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                  {s.icon}
                </div>
                {s.done ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase italic">Consolidado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-full border border-zinc-800">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-black text-amber-500 uppercase italic">Pendiente</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{s.title}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4 opacity-70">{s.subtitle}</p>
              
              <p className="text-zinc-400 text-xs leading-relaxed italic mb-8">
                {s.description}
              </p>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-800/50 flex items-center justify-between">
              <span className="text-[9px] font-black text-zinc-500 uppercase italic">{s.meta}</span>
              <button 
                onClick={() => navigate(s.link)}
                className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${s.done ? 'text-zinc-500 hover:text-emerald-500' : 'text-emerald-500 hover:gap-4'}`}
              >
                {s.done ? 'Editar' : 'Completar'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-12 p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] flex items-center gap-6">
        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
          <Zap className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed italic font-medium">
          "El <span className="text-zinc-300 font-bold">Prompt Maestro</span> es tu arma secreta. Concatena el ADN, el Stack, los Requisitos y el estado actual del Kanban para que cualquier IA entienda exactamente en qué punto del proyecto estás sin que tengas que explicar nada."
        </p>
      </div>
    </div>
  );
};

export default ProjectDashboard;
