import React from 'react';
import { BarChart3, TrendingUp, HelpCircle, Users, CheckCircle2, MessageSquare } from 'lucide-react';
import type { Member } from '../../../store/useAgencyStore';

interface AgencyContentDashboardProps {
  contents: any[];
  agencyMembers: Member[];
}

export const AgencyContentDashboard: React.FC<AgencyContentDashboardProps> = ({
  contents,
  agencyMembers
}) => {
  // Filtrar solo las planificaciones semanales estructuradas
  const weeklyPlans = contents.filter(c => c.estado === 'Plan Semanal' && (c.resumen_analitico || c.resumenAnalitico));

  // Parsear el JSON del planificador
  const parsedPlans = weeklyPlans.map(p => {
    let detail = p.resumen_analitico || p.resumenAnalitico;
    if (typeof detail === 'string') {
      try {
        detail = JSON.parse(detail);
      } catch {
        detail = {};
      }
    }
    return {
      id: p.id,
      miembroId: p.miembro_id || p.miembroId,
      titulo: p.titulo,
      detail: detail
    };
  });

  // 1. Calcular DMs totales generados
  const totalDms = parsedPlans.reduce((sum, p) => sum + (p.detail?.analisisCierre?.totalDms || 0), 0);

  // 2. Calcular publicaciones totales planificadas vs programadas
  let totalPostsPlanned = 0;
  let totalPostsScheduled = 0;
  const platformStats: Record<string, number> = {};
  const memberStats: Record<string, { planned: number, scheduled: number }> = {};

  parsedPlans.forEach(p => {
    const posts = p.detail?.posts || [];
    totalPostsPlanned += posts.length;
    
    // Contribución de miembros
    const mId = p.miembroId;
    if (mId) {
      if (!memberStats[mId]) {
        memberStats[mId] = { planned: 0, scheduled: 0 };
      }
      memberStats[mId].planned += posts.length;
    }

    posts.forEach((post: any) => {
      const isScheduled = !!post.progreso?.programado;
      if (isScheduled) {
        totalPostsScheduled++;
        if (mId) {
          memberStats[mId].scheduled++;
        }
      }

      // Plataformas
      const platform = post.plataforma || 'Otros';
      platformStats[platform] = (platformStats[platform] || 0) + 1;
    });
  });

  // Mejores posts y decisiones
  const bestPosts = parsedPlans
    .map(p => p.detail?.analisisCierre?.mejorPost)
    .filter(val => val && val.trim() !== '');
    
  const lessonsLearned = parsedPlans
    .map(p => p.detail?.analisisCierre?.queFunciono)
    .filter(val => val && val.trim() !== '');

  const decisions = parsedPlans
    .map(p => p.detail?.analisisCierre?.decisionProximaSemana)
    .filter(val => val && val.trim() !== '');

  return (
    <div className="space-y-6">
      
      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-450 shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Leads / DMs Generados</p>
            <h4 className="text-2xl font-black text-white mt-0.5">{totalDms}</h4>
            <p className="text-[9px] text-zinc-550">Suma total reportada en cierres</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-450 shrink-0">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Planificación Semanal</p>
            <h4 className="text-2xl font-black text-white mt-0.5">{weeklyPlans.length} Semanas</h4>
            <p className="text-[9px] text-zinc-550">Hojas de ruta cargadas</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-450 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Post Publicados / Listos</p>
            <h4 className="text-2xl font-black text-white mt-0.5">
              {totalPostsScheduled} <span className="text-zinc-650 text-sm font-normal">/ {totalPostsPlanned}</span>
            </h4>
            <p className="text-[9px] text-zinc-550">Posts completados y programados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Contribución del Equipo */}
        <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800/60">
            <Users size={14} className="text-emerald-450" />
            <span>Planificación y Cumplimiento por Miembro</span>
          </h3>

          <div className="space-y-4">
            {agencyMembers.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-600">No hay miembros registrados.</div>
            ) : (
              agencyMembers.map(m => {
                const stats = memberStats[m.usuario_id] || { planned: 0, scheduled: 0 };
                const percent = stats.planned > 0 ? Math.round((stats.scheduled / stats.planned) * 100) : 0;
                
                return (
                  <div key={m.usuario_id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-200">{m.usuario?.nombre_completo || 'Colaborador'}</span>
                      <span className="text-zinc-500 text-[10px]">
                        {stats.scheduled} programados de {stats.planned} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                      <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribución por Plataformas */}
        <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800/60">
            <TrendingUp size={14} className="text-sky-450" />
            <span>Presencia en Redes Sociales</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(platformStats).length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-600">Sin datos de publicaciones.</div>
            ) : (
              Object.entries(platformStats).map(([platform, count]) => {
                const pct = totalPostsPlanned > 0 ? Math.round((count / totalPostsPlanned) * 100) : 0;
                return (
                  <div key={platform} className="flex items-center justify-between bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-bold uppercase text-[9px] text-zinc-450">
                        {platform}
                      </span>
                      <span className="text-zinc-500 text-[10px]">{count} posts ({pct}%)</span>
                    </div>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lecciones, Mejores Posts y Próximas Decisiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Muro de Éxitos */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider pb-2 border-b border-zinc-800/60">
            🏆 Contenido Más Destacado
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
            {bestPosts.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-600">Aún no se han reportado posts destacados.</div>
            ) : (
              bestPosts.map((post, idx) => (
                <div key={idx} className="p-3 bg-zinc-950/35 border border-zinc-850 rounded-2xl text-xs text-zinc-350 italic">
                  "{post}"
                </div>
              ))
            )}
          </div>
        </div>

        {/* Aprendizajes y Próximos Pasos */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider pb-2 border-b border-zinc-800/60">
            💡 Aprendizajes y Decisiones Clave
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar text-xs">
            {decisions.length === 0 && lessonsLearned.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-600">Sin registros de diagnósticos semanales.</div>
            ) : (
              <>
                {lessonsLearned.map((lesson, idx) => (
                  <div key={`l-${idx}`} className="p-3 bg-zinc-950/35 border border-emerald-500/10 rounded-2xl text-zinc-350">
                    <strong className="text-emerald-450 font-bold block mb-1">Funcionó bien:</strong>
                    {lesson}
                  </div>
                ))}
                {decisions.map((decision, idx) => (
                  <div key={`d-${idx}`} className="p-3 bg-zinc-950/35 border border-indigo-500/10 rounded-2xl text-zinc-350">
                    <strong className="text-indigo-400 font-bold block mb-1">Decisión próxima semana:</strong>
                    {decision}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
