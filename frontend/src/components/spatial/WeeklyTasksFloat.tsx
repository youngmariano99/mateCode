import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Briefcase, Layers, Copy, ArrowUpRight, 
  Maximize2, X, Clipboard, ExternalLink, Filter, 
  User, CheckCircle2, AlertTriangle, Monitor, Sparkles
} from 'lucide-react';
import { useAgencyStore } from '../../store/useAgencyStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useOperationsStore, parseColumnName } from '../../store/useOperationsStore';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { DiagramWorkspace } from '../design/DiagramWorkspace';

export const WeeklyTasksFloat: React.FC = () => {
  const navigate = useNavigate();
  const { 
    agencies, 
    currentAgencyId, 
    fetchAgencies,
    getAgencyWorkspacesWithProjects 
  } = useAgencyStore();

  const { 
    tasks, 
    kanbanColumns, 
    fetchTasks, 
    fetchKanbanColumns 
  } = useOperationsStore();

  const { 
    workspaceId, 
    activeProjectId, 
    activeRoom, 
    setWorkspaceId, 
    setActiveProjectId, 
    setActiveRoom 
  } = useWorkspaceStore();

  // Component States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'agency' | 'devhub'>('agency');
  const [profile, setProfile] = useState<any>(null);

  // Filters State
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
  const [workspacesData, setWorkspacesData] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<boolean>(true);

  // Loaded Data for Agile Tickets
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Modal States for Quick Resources
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);

  // References to handle click outside
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch current profile info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/Workspace/profile');
        setProfile(data);
      } catch (err) {
        console.warn("Error fetching user profile:", err);
      }
    };
    fetchProfile();
  }, [workspaceId]);

  // Load agencies if not present
  useEffect(() => {
    if (agencies.length === 0) {
      fetchAgencies();
    }
  }, [agencies]);

  // Set default selected agency
  useEffect(() => {
    if (currentAgencyId) {
      setSelectedAgencyId(currentAgencyId);
    } else if (agencies.length > 0) {
      setSelectedAgencyId(agencies[0].id);
    }
  }, [currentAgencyId, agencies]);

  // Load workspaces and projects for the selected agency
  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!selectedAgencyId) return;
      try {
        const data = await getAgencyWorkspacesWithProjects(selectedAgencyId);
        setWorkspacesData(data);
        
        // Match current workspace and project or default to first
        const matchedWs = data.find(w => w.id === workspaceId);
        if (matchedWs) {
          setSelectedWorkspaceId(matchedWs.id);
          const matchedProj = matchedWs.projects?.find((p: any) => p.id === activeProjectId);
          if (matchedProj) {
            setSelectedProjectId(matchedProj.id);
          } else if (matchedWs.projects?.length > 0) {
            setSelectedProjectId(matchedWs.projects[0].id);
          } else {
            setSelectedProjectId('');
          }
        } else if (data.length > 0) {
          setSelectedWorkspaceId(data[0].id);
          if (data[0].projects?.length > 0) {
            setSelectedProjectId(data[0].projects[0].id);
          } else {
            setSelectedProjectId('');
          }
        }
      } catch (e) {
        console.error("Error loading workspaces and projects:", e);
      }
    };
    loadWorkspaces();
  }, [selectedAgencyId, currentAgencyId]);

  // Load DevHub Tickets when selectedProjectId changes
  useEffect(() => {
    const loadDevHubData = async () => {
      if (!selectedProjectId) {
        setTickets([]);
        setActiveSprint(null);
        return;
      }
      setLoadingTickets(true);
      try {
        // Fetch sprints of project
        const sprints = await api.get(`/api/projects/${selectedProjectId}/sprints`) as any[];
        const liveSprint = sprints.find(s => s.estado === 'Activo');
        setActiveSprint(liveSprint || null);

        // Fetch tickets
        const allTickets = await api.get(`/api/kanban/tickets/${selectedProjectId}`) as any[];
        if (liveSprint) {
          setTickets(allTickets.filter(t => t.sprintId === liveSprint.id));
        } else {
          setTickets(allTickets);
        }
      } catch (e) {
        console.warn("Error loading tickets/sprints for floating popover:", e);
        setTickets([]);
        setActiveSprint(null);
      } finally {
        setLoadingTickets(false);
      }
    };
    if (activeTab === 'devhub') {
      loadDevHubData();
    }
  }, [selectedProjectId, activeTab]);

  // Helper date logic for agency tasks
  const getWeekRange = (date: Date = new Date()) => {
    const currentDay = date.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(date);
    monday.setDate(date.getDate() + distanceToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      monday: monday.toISOString().split('T')[0],
      sunday: sunday.toISOString().split('T')[0]
    };
  };

  const getDayLabel = (dateStr?: string) => {
    if (!dateStr) return '';
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return days[d.getDay()];
    }
    return '';
  };

  const { monday, sunday } = getWeekRange();

  // Colors for tickets and operational tasks
  const getStatusColor = (estado: string) => {
    const col = kanbanColumns.find(c => {
      const parsed = parseColumnName(c.nombre);
      return parsed.name.toLowerCase() === estado.toLowerCase();
    });
    if (col) return parseColumnName(col.nombre).color;
    return '#71717a';
  };

  const getTicketStatusColor = (estado: string) => {
    switch(estado.toLowerCase()) {
      case 'todo':
      case 'to do':
      case 'por hacer':
        return '#3b82f6'; // Blue
      case 'in progress':
      case 'en progreso':
        return '#f59e0b'; // Amber
      case 'done':
      case 'terminado':
      case 'hecho':
        return '#10b981'; // Emerald
      default:
        return '#a855f7'; // Purple (Backlog)
    }
  };

  // Filter tasks based on settings
  const filteredAgencyTasks = tasks.filter(t => {
    // 1. Current Week Filter
    if (!t.fecha_planificada) return false;
    const dateStr = t.fecha_planificada.split('T')[0];
    const isInWeek = dateStr >= monday && dateStr <= sunday;
    if (!isInWeek) return false;

    // 2. Workspace Filter
    if (selectedWorkspaceId && t.espacio_trabajo_id !== selectedWorkspaceId) return false;

    // 3. Project Filter
    if (selectedProjectId && t.proyecto_id !== selectedProjectId) return false;

    // 4. Assigned to me Filter
    if (filterAssignee && profile && t.usuario_asignado_id !== profile.id) return false;

    // 5. Status Filter
    if (filterStatus !== 'all') {
      const isDone = parseColumnName(t.estado).isDone;
      if (filterStatus === 'completed' && !isDone) return false;
      if (filterStatus === 'pending' && isDone) return false;
    }

    return true;
  });

  const filteredTickets = tickets.filter(t => {
    // 1. Assignee Filter
    if (filterAssignee && profile && t.responsableId !== profile.id) return false;

    // 2. Status Filter
    if (filterStatus !== 'all') {
      const statusLower = t.estado.toLowerCase();
      const isDone = statusLower === 'done' || statusLower === 'terminado' || statusLower === 'hecho';
      if (filterStatus === 'completed' && !isDone) return false;
      if (filterStatus === 'pending' && isDone) return false;
    }

    return true;
  });

  // Action: Copy technical details prompt for AI
  const handleCopyDetails = (item: any, type: 'agency' | 'ticket') => {
    let promptText = '';
    if (type === 'agency') {
      promptText = `### MATECODE TAREA OPERATIVA DE AGENCIA ###\nTítulo: ${item.titulo}\nDescripción: ${item.descripcion || 'Sin descripción'}\nEstado actual: ${item.estado}\nSemana: Lunes ${monday} al Domingo ${sunday}\nPlanificada: ${item.fecha_planificada ? item.fecha_planificada.split('T')[0] : 'Sin fecha'}`;
    } else {
      const criteria = Array.isArray(item.criteriosJson) && item.criteriosJson.length > 0 
        ? item.criteriosJson.map((c: string) => `- ${c}`).join('\n') 
        : 'Ninguno especificado';
      const actions = Array.isArray(item.tareasJson) && item.tareasJson.length > 0 
        ? item.tareasJson.map((a: any) => `- [${a.capa}] ${a.detalle}`).join('\n') 
        : 'Ninguno especificado';
        
      promptText = `### MATECODE TICKET TÉCNICO DE DESARROLLO (AGILE) ###\nTítulo: ${item.titulo}\nTipo: ${item.tipo}\nPrioridad: ${item.prioridad || 'MVP'}\nÉpica/Módulo: ${item.epicTag || 'General'}\nEstado: ${item.estado}\n\n[CRITERIOS DE ACEPTACIÓN]\n${criteria}\n\n[PLAN DE ACCIÓN TÉCNICO]\n${actions}`;
    }

    navigator.clipboard.writeText(promptText);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Prompt de la tarea copiado',
      showConfirmButton: false,
      timer: 1500,
      background: '#18181b',
      color: '#fff'
    });
  };

  // Action: Navigate directly to task / project room
  const handleNavigateDirect = (item: any, type: 'agency' | 'ticket') => {
    if (type === 'agency') {
      // Setup store and navigate to agency tasks modal
      setWorkspaceId(null);
      setActiveProjectId(null);
      setActiveRoom('idle');
      navigate('/workspace-selector?view=workspaces');
      
      // Delay opening modal to ensure routing has completed
      setTimeout(() => {
        const dashboardBtn = document.querySelector('[data-room="tasks"]');
        if (dashboardBtn) (dashboardBtn as HTMLElement).click();
      }, 500);
    } else {
      // Setup workspace store to active room
      if (selectedWorkspaceId) {
        setWorkspaceId(selectedWorkspaceId);
        setActiveProjectId(selectedProjectId);
        setActiveRoom('phase03'); // teletransportar a DevHub (Desarrollo)
        setIsOpen(false);
        navigate(`/workspace/${selectedWorkspaceId}`);
      }
    }
  };

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Load general tasks for calculations
  useEffect(() => {
    if (isOpen) {
      fetchTasks();
      fetchKanbanColumns();
    }
  }, [isOpen]);

  const activeProjectData = workspacesData.find(w => w.id === selectedWorkspaceId)
    ?.projects?.find((p: any) => p.id === selectedProjectId);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[340] font-sans flex flex-col items-start" ref={popoverRef}>
        {/* Expanded Popover Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-[23rem] h-[480px] bg-zinc-950/90 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl overflow-hidden mb-4 flex flex-col"
            >
              {/* Header Tab selectors */}
              <header className="flex bg-zinc-900/50 border-b border-white/5 p-1.5 gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveTab('agency')}
                  className={`flex-1 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'agency' 
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Briefcase size={12} />
                  <span>Agencia</span>
                </button>
                <button
                  onClick={() => setActiveTab('devhub')}
                  className={`flex-1 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'devhub' 
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Layers size={12} />
                  <span>Proyectos</span>
                </button>
              </header>

              {/* Filters Area */}
              <div className="p-4 bg-zinc-900/20 border-b border-white/5 space-y-3 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  {/* Agency Selector */}
                  <div>
                    <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Empresa</label>
                    <select
                      value={selectedAgencyId}
                      onChange={e => setSelectedAgencyId(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 outline-none"
                    >
                      {agencies.map(a => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Workspace Selector */}
                  <div>
                    <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Espacio</label>
                    <select
                      value={selectedWorkspaceId}
                      onChange={e => {
                        setSelectedWorkspaceId(e.target.value);
                        const ws = workspacesData.find(w => w.id === e.target.value);
                        if (ws && ws.projects?.length > 0) {
                          setSelectedProjectId(ws.projects[0].id);
                        } else {
                          setSelectedProjectId('');
                        }
                      }}
                      className="w-full bg-zinc-900/80 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 outline-none"
                    >
                      <option value="">Todos los espacios</option>
                      {workspacesData.map(w => (
                        <option key={w.id} value={w.id}>{w.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Project Selector */}
                  <div>
                    <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Proyecto</label>
                    <select
                      value={selectedProjectId}
                      onChange={e => setSelectedProjectId(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 outline-none"
                      disabled={!selectedWorkspaceId}
                    >
                      <option value="">Todos los proyectos</option>
                      {workspacesData.find(w => w.id === selectedWorkspaceId)
                        ?.projects?.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Estado</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-300 outline-none"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendientes</option>
                      <option value="completed">Completados</option>
                    </select>
                  </div>
                </div>

                {/* Assigned to me toggle & Quick tools */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={filterAssignee}
                      onChange={e => setFilterAssignee(e.target.checked)}
                      className="rounded border-white/10 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20 w-3.5 h-3.5"
                    />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Asignadas a mí</span>
                  </label>

                  {/* Oráculo Direct Modal shortcut */}
                  {selectedProjectId && activeProjectData && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsDiagramOpen(true)}
                        className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                        title="Ver Diagramas del Proyecto"
                      >
                        <Monitor size={10} />
                        <span>Planos</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks / Tickets List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {activeTab === 'agency' ? (
                  /* AGENCY TASKS */
                  filteredAgencyTasks.length > 0 ? (
                    filteredAgencyTasks.map(task => {
                      const taskColor = getStatusColor(task.estado);
                      const dayLabel = getDayLabel(task.fecha_planificada);
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-3 bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-850 rounded-2xl p-3 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: taskColor, boxShadow: `0 0 6px ${taskColor}44` }}
                            />
                            <div className="min-w-0">
                              <span className="text-xs text-zinc-200 font-bold block truncate">
                                {task.titulo}
                              </span>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mt-0.5">
                                {task.proyecto?.nombre || 'Operativo'} • {task.estado}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {dayLabel && (
                              <span className="text-[8px] text-zinc-400 font-black uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                {dayLabel}
                              </span>
                            )}
                            <button
                              onClick={() => handleCopyDetails(task, 'agency')}
                              className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all"
                              title="Copiar Prompt IA"
                            >
                              <Clipboard size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                      <Calendar size={24} className="text-zinc-650 mb-2" />
                      <span className="text-xs text-zinc-400 font-medium">Sin tareas en la agencia</span>
                    </div>
                  )
                ) : (
                  /* DEVHUB AGILE TICKETS */
                  loadingTickets ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <Sparkles size={24} className="text-emerald-500 animate-spin mb-2" />
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Cargando tickets...</span>
                    </div>
                  ) : filteredTickets.length > 0 ? (
                    filteredTickets.map(ticket => {
                      const ticketColor = getTicketStatusColor(ticket.estado);
                      return (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between gap-3 bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-850 rounded-2xl p-3 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: ticketColor, boxShadow: `0 0 6px ${ticketColor}44` }}
                            />
                            <div className="min-w-0">
                              <span className="text-xs text-zinc-200 font-bold block truncate">
                                {ticket.titulo}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[7px] font-black uppercase px-1 rounded border ${
                                  ticket.tipo === 'Bug' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  ticket.tipo === 'DeudaTécnica' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {ticket.tipo}
                                </span>
                                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                                  {ticket.epicTag || 'Core'} • {ticket.estado}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleCopyDetails(ticket, 'ticket')}
                              className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all"
                              title="Copiar Prompt IA"
                            >
                              <Clipboard size={12} />
                            </button>
                            <button
                              onClick={() => handleNavigateDirect(ticket, 'ticket')}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 rounded-lg transition-all"
                              title="Ir a Sala de Desarrollo"
                            >
                              <ArrowUpRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                      <Layers size={24} className="text-zinc-650 mb-2" />
                      <span className="text-xs text-zinc-400 font-medium">
                        {activeSprint ? 'Sin tickets en el sprint' : 'Selecciona un proyecto con sprint activo'}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Footer Shortcut to Full Modal */}
              <button
                onClick={() => {
                  if (activeTab === 'agency') {
                    setWorkspaceId(null);
                    setActiveProjectId(null);
                    setActiveRoom('idle');
                    navigate('/workspace-selector?view=workspaces');
                    setTimeout(() => {
                      const tasksBtn = document.querySelector('[data-room="tasks"]');
                      if (tasksBtn) (tasksBtn as HTMLElement).click();
                    }, 500);
                  } else {
                    if (selectedWorkspaceId) {
                      setWorkspaceId(selectedWorkspaceId);
                      setActiveProjectId(selectedProjectId);
                      setActiveRoom('phase03'); // DevHub
                      navigate(`/workspace/${selectedWorkspaceId}`);
                    }
                  }
                  setIsOpen(false);
                }}
                className="py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5 rounded-b-[2.5rem] w-full font-black border-t border-white/5"
              >
                <span>Ver Consola Completa</span>
                <ExternalLink size={10} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full border border-white/10 backdrop-blur-2xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
            isOpen 
              ? "bg-emerald-500 text-zinc-950 shadow-emerald-500/20 border-emerald-400/30" 
              : "bg-[#0A0F1A]/80 hover:bg-[#141d33] text-emerald-400"
          }`}
          title="Tareas de la Semana"
        >
          <Calendar size={22} className={isOpen ? "shrink-0 animate-in spin-in-90 duration-500" : "shrink-0"} />
        </motion.button>
      </div>

      {/* Fullscreen Diagram / Architecture Modal */}
      {isDiagramOpen && selectedProjectId && (
        <div className="fixed inset-0 z-[9999] bg-black overflow-y-auto">
          <div className="absolute top-6 right-6 z-[10000]">
            <button
              onClick={() => setIsDiagramOpen(false)}
              className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all shadow-md"
              title="Cerrar Planos"
            >
              <X size={20} />
            </button>
          </div>
          <DiagramWorkspace />
        </div>
      )}
    </>
  );
};
