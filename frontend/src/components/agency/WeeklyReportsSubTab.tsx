import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, ChevronDown, ChevronUp, AlertCircle, BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';
import type { WeeklyReport } from '../../store/useOperationsStore';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export const WeeklyReportsSubTab: React.FC = () => {
  const { 
    weeklyReports, fetchWeeklyReports, createWeeklyReport, deleteWeeklyReport, generateWeeklyMetricsPreview 
  } = useOperationsStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [metrics, setMetrics] = useState<any | null>(null);
  const [lessons, setLessons] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyReports();
    // Default date range: last 7 days
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setDateRange({
      start: lastWeek.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  }, []);

  const handleFetchMetrics = async () => {
    if (!dateRange.start || !dateRange.end) {
      Swal.fire({ title: 'Atención', text: 'Define ambas fechas de rango.', icon: 'warning' });
      return;
    }
    try {
      const data = await generateWeeklyMetricsPreview(dateRange.start, dateRange.end);
      setMetrics(data);
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleSaveReport = async () => {
    if (!dateRange.start || !dateRange.end || !lessons.trim()) {
      Swal.fire({ title: 'Atención', text: 'Completa las lecciones aprendidas antes de guardar.', icon: 'warning' });
      return;
    }
    try {
      await createWeeklyReport(dateRange.start, dateRange.end, lessons.trim());
      setIsGenerating(false);
      setMetrics(null);
      setLessons('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Informe semanal guardado',
        showConfirmButton: false,
        timer: 1500,
        background: '#09090b',
        color: '#f4f4f5'
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar este informe?',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) {
      await deleteWeeklyReport(id);
    }
  };

  const parseMetrics = (metricsJson: string) => {
    try {
      return typeof metricsJson === 'string' ? JSON.parse(metricsJson) : metricsJson;
    } catch {
      return {};
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Informes de Rendimiento Semanal</h3>
          <p className="text-zinc-500 text-xs mt-0.5">Reportes consolidados con recolección de métricas operativas y lecciones de equipo.</p>
        </div>
        {!isGenerating && (
          <button
            onClick={() => setIsGenerating(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/10"
          >
            <Plus size={14} />
            <span>Generar Informe</span>
          </button>
        )}
      </div>

      {isGenerating ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-3xl space-y-6"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black uppercase text-zinc-400 tracking-wider">Nuevo Reporte de Rendimiento</h4>
            <button
              onClick={() => { setIsGenerating(false); setMetrics(null); }}
              className="text-xs text-zinc-550 hover:text-zinc-350 transition-colors"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Fecha de Inicio</label>
              <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Fecha de Cierre</label>
              <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white" />
            </div>
            <button
              onClick={handleFetchMetrics}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-zinc-700/60"
            >
              <BarChart3 size={14} />
              <span>Calcular Métricas</span>
            </button>
          </div>

          {metrics && (
            <div className="space-y-6 pt-4 border-t border-zinc-850">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Tareas Operativas</span>
                  <span className="text-xl font-black text-white mt-1">{metrics.tareasCompletadas} <span className="text-xs text-zinc-500">/ {metrics.tareasCreadas}</span></span>
                  <span className="text-[9px] text-zinc-450 mt-1">Completadas vs Creadas</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">CRM & Clientes</span>
                  <span className="text-xl font-black text-teal-400 mt-1">+{metrics.leadsNuevos}</span>
                  <span className="text-[9px] text-zinc-450 mt-1">Nuevos Leads Captados</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Contenido Creado</span>
                  <span className="text-xl font-black text-indigo-400 mt-1">{metrics.contenidosPublicados} <span className="text-xs text-zinc-500">/ {metrics.contenidosPlanificados}</span></span>
                  <span className="text-[9px] text-zinc-450 mt-1">Publicados vs Planificados</span>
                </div>
                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Balance Neto</span>
                  <span className={`text-xl font-black mt-1 flex items-center ${metrics.balanceNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <DollarSign size={16} />
                    {metrics.balanceNeto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-zinc-450 mt-1">Ingresos: ${metrics.ingresos.toLocaleString()} | Egresos: ${metrics.egresos.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Lecciones Aprendidas, Retroalimentación y Conclusiones</label>
                <textarea
                  rows={4}
                  value={lessons}
                  onChange={e => setLessons(e.target.value)}
                  placeholder="¿Qué funcionó bien esta semana? ¿Qué bloqueos enfrentamos? ¿Qué mejoras implementaremos?"
                  className="w-full bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl text-xs text-white placeholder-zinc-750 focus:border-zinc-700 outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveReport}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/10"
                >
                  Guardar Informe Semanal
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {weeklyReports.length === 0 ? (
            <div className="bg-zinc-900/10 border border-zinc-850 rounded-3xl p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <AlertCircle size={24} className="text-zinc-650" />
              <span>Aún no hay informes semanales guardados en la agencia.</span>
            </div>
          ) : (
            weeklyReports.map(report => {
              const repMetrics = parseMetrics(report.metricasJson);
              const isExpanded = expandedReportId === report.id;
              
              return (
                <div
                  key={report.id}
                  onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                  className="bg-zinc-950/40 border border-zinc-850 hover:border-zinc-750 rounded-2xl overflow-hidden cursor-pointer transition-all"
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-indigo-400">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">
                          Rendimiento: {new Date(report.fechaInicio).toLocaleDateString()} - {new Date(report.fechaFin).toLocaleDateString()}
                        </h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Creado el: {new Date(report.fecha_creacion).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteReport(e, report.id)}
                        className="p-1.5 text-zinc-650 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
                        title="Eliminar informe"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="text-zinc-550">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-zinc-900 bg-zinc-950/90 overflow-hidden"
                      >
                        <div className="p-5 space-y-4 text-xs">
                          {/* Metrics summary grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-zinc-900">
                            <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Tareas completadas</span>
                              <span className="text-sm font-black text-white mt-1">
                                {repMetrics.tareasCompletadas || 0} / {repMetrics.tareasCreadas || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Leads captados</span>
                              <span className="text-sm font-black text-teal-400 mt-1">
                                +{repMetrics.leadsNuevos || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Contenidos publicados</span>
                              <span className="text-sm font-black text-indigo-400 mt-1">
                                {repMetrics.contenidosPublicados || 0} / {repMetrics.contenidosPlanificados || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Net Net financiero</span>
                              <span className={`text-sm font-black mt-1 flex items-center ${repMetrics.balanceNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                <DollarSign size={12} />
                                {(repMetrics.balanceNeto || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Lecciones Aprendidas y Conclusiones</span>
                            <p className="text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-900 whitespace-pre-line">
                              {report.leccionesAprendidas}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
