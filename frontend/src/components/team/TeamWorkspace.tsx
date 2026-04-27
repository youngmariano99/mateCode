import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { 
  Users, Search, Shield, ShieldCheck, 
  Settings, CheckCircle2, Circle, Plus,
  LayoutGrid, X, Trash2, Mail, BadgeCheck,
  Code, Briefcase, Database, Palette, Terminal, SearchIcon, Rocket
} from 'lucide-react';

interface TeamMember {
  id: string;
  nombreCompleto: string;
  email: string;
  etiquetaProceso: string; // Product Owner, Dev, etc.
  etiquetaTecnica: string; // Frontend, Backend, etc.
  proyectosAsignados: string[]; // IDs de proyectos
}

interface Project {
  id: string;
  nombre: string;
}

export const TeamWorkspace: React.FC = () => {
  const { tenantId } = useProject();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Opciones de Roles
  const rolesProceso = ['Product Owner', 'Scrum Master', 'Desarrollador', 'Stakeholder', 'QA Lead'];
  const rolesTecnicos = ['Frontend', 'Backend', 'Fullstack', 'Diseñador Web', 'Analista de Datos', 'DB Admin', 'DevOps'];

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const [membersData, projectsData] = await Promise.all([
        api.get('/Team'),
        api.get('/Project')
      ]);
      
      const adaptedMembers = (membersData as any[]).map(m => ({
        ...m,
        etiquetaProceso: m.etiquetaRol?.split('|')[0]?.trim() || 'Desarrollador',
        etiquetaTecnica: m.etiquetaRol?.split('|')[1]?.trim() || 'General',
        proyectosAsignados: m.proyectosAsignados || [] 
      }));

      setTeam(adaptedMembers);
      setProjects(projectsData as Project[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMember = async () => {
    if (!selectedMember) return;
    try {
      await api.put('/Team/member-setup', {
        usuarioId: selectedMember.id,
        etiquetaRol: `${selectedMember.etiquetaProceso} | ${selectedMember.etiquetaTecnica}`,
        projectIds: selectedMember.proyectosAsignados
      });
      
      Swal.fire({ title: 'Perfil Sincronizado', text: 'Los cambios se han guardado en la base de datos.', icon: 'success', background: '#18181b', color: '#fff' });
      setSelectedMember(null);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'No se pudieron guardar los cambios.', icon: 'error', background: '#18181b', color: '#fff' });
    }
  };

  const toggleProjectAccess = (memberId: string, projectId: string) => {
    if (!selectedMember || selectedMember.id !== memberId) return;

    const newProjects = selectedMember.proyectosAsignados.includes(projectId)
      ? selectedMember.proyectosAsignados.filter(id => id !== projectId)
      : [...selectedMember.proyectosAsignados, projectId];

    setSelectedMember({ ...selectedMember, proyectosAsignados: newProjects });
  };

  const handleSearchUsers = async (query: string) => {
    setSearchTerm(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await api.get(`/Team/search?q=${query}`);
      setSearchResults(results as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const inviteMember = async (user: any) => {
    const { value: roles } = await Swal.fire({
      title: `Configurar acceso para ${user.nombreCompleto}`,
      background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
      html: `
        <div class="text-left space-y-4 p-2">
          <div>
            <label class="text-[10px] font-black uppercase text-zinc-500">Rol de Proceso</label>
            <select id="role-proc" class="swal2-input bg-zinc-950 text-white w-full m-0 border-zinc-800">
               ${rolesProceso.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black uppercase text-zinc-500">Rol Técnico</label>
            <select id="role-tec" class="swal2-input bg-zinc-950 text-white w-full m-0 border-zinc-800">
               ${rolesTecnicos.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      preConfirm: () => ({
        proceso: (document.getElementById('role-proc') as HTMLSelectElement).value,
        tecnico: (document.getElementById('role-tec') as HTMLSelectElement).value
      })
    });

    if (roles) {
      try {
        await api.post('/Team/invite', { 
          usuarioId: user.id, 
          etiquetaRol: `${roles.proceso} | ${roles.tecnico}` 
        });
        Swal.fire({ title: 'Invitación Enviada', icon: 'success', background: '#18181b', color: '#fff' });
        setSearchTerm('');
        setSearchResults([]);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      
      {/* Header Inmersivo con Buscador LoL Style */}
      <div className="flex items-center justify-between p-8 bg-white/5 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
            <Users className="text-emerald-500" size={32} />
          </div>
          <div className="hidden md:block">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Team <span className="text-emerald-500">Identity</span></h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Gestión de Roles y Acceso Granular</p>
          </div>
        </div>

        {/* Buscador Central de Usuarios Registrados */}
        <div className="relative w-full max-w-xl mx-8">
            <div className={`absolute inset-0 bg-emerald-500/10 blur-xl rounded-full transition-opacity duration-500 ${searchTerm ? 'opacity-100' : 'opacity-0'}`} />
            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl px-6 py-3.5 focus-within:border-emerald-500/50 transition-all shadow-2xl">
                <Search size={18} className={searchTerm ? 'text-emerald-500' : 'text-zinc-500'} />
                <input 
                  value={searchTerm}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Buscar usuario por nombre (ej: Mariano...)"
                  className="bg-transparent border-none outline-none text-sm font-bold text-white px-4 w-full placeholder:text-zinc-600 uppercase tracking-wider"
                />
                {isSearching && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
            </div>

            {/* Resultados del Buscador */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-[150] animate-in slide-in-from-top-2">
                 <div className="p-4 bg-zinc-950/50 border-b border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Usuarios Encontrados en MateCode</span>
                 </div>
                 {searchResults.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => inviteMember(user)}
                      className="p-4 flex items-center justify-between hover:bg-emerald-500/10 cursor-pointer transition-all group"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-xs font-black text-white group-hover:bg-emerald-500 transition-colors">
                            {user.nombreCompleto[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase">{user.nombreCompleto}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{user.email}</p>
                          </div>
                       </div>
                       <Plus size={18} className="text-zinc-600 group-hover:text-emerald-500" />
                    </div>
                 ))}
              </div>
            )}
        </div>

        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
            </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
          
          {/* Listado de Miembros (Identity Cards) */}
          <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                  {team.map(member => (
                    <div 
                      key={member.id} 
                      onClick={() => setSelectedMember(member)}
                      className={`relative group p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${
                        selectedMember?.id === member.id 
                        ? 'bg-zinc-900 border-emerald-500 shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)]' 
                        : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                      }`}
                    >
                       {/* Badge de Verificación */}
                       <div className="absolute top-6 right-6">
                          <BadgeCheck className={selectedMember?.id === member.id ? 'text-emerald-500' : 'text-zinc-700'} size={24} />
                       </div>

                       <div className="flex items-start gap-6">
                          <div className="relative">
                            <div className={`absolute inset-0 blur-xl rounded-2xl opacity-20 ${selectedMember?.id === member.id ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            <div className="relative w-20 h-20 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white italic">
                                {member.nombreCompleto[0]}
                            </div>
                          </div>
                          <div className="flex-1 pt-2">
                             <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">{member.nombreCompleto}</h3>
                             <p className="text-[10px] text-zinc-600 font-mono mt-2 tracking-widest">{member.email}</p>
                             
                             {/* Double Tags */}
                             <div className="flex flex-wrap gap-2 mt-6">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500">
                                   <Briefcase size={10} />
                                   <span className="text-[9px] font-black uppercase tracking-widest">{member.etiquetaProceso}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500">
                                   <Code size={10} />
                                   <span className="text-[9px] font-black uppercase tracking-widest">{member.etiquetaTecnica}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                          <div className="flex -space-x-2">
                             {member.proyectosAsignados.length > 0 ? member.proyectosAsignados.map((pid, i) => (
                               <div key={i} className="w-8 h-8 rounded-lg bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[8px] font-bold text-zinc-500" title={projects.find(p=>p.id===pid)?.nombre}>
                                 {projects.find(p=>p.id===pid)?.nombre[0]}
                               </div>
                             )) : <span className="text-[9px] text-zinc-700 uppercase font-black">Sin proyectos</span>}
                          </div>
                          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                             {member.proyectosAsignados.length} Proyectos
                          </div>
                       </div>
                    </div>
                  ))}
              </div>
          </div>

          {/* Panel Lateral: Configuración de Acceso */}
          {selectedMember && (
            <div className="w-[450px] bg-[#0A0F1A] border-l border-white/5 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col shadow-2xl">
                <div className="p-10 border-b border-white/5 bg-zinc-900/20">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-3xl font-black text-white uppercase italic">Configurar <span className="text-emerald-500">Perfil</span></h2>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{selectedMember.nombreCompleto}</p>
                      </div>
                      <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="text-zinc-500" /></button>
                   </div>

                   <div className="space-y-8 mt-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Jerarquía de Proceso</label>
                         <div className="grid grid-cols-2 gap-2">
                            {rolesProceso.map(r => (
                              <button 
                                key={r} 
                                onClick={() => setSelectedMember({ ...selectedMember, etiquetaProceso: r })}
                                className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedMember.etiquetaProceso === r ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/20'}`}
                              >
                                {r}
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Perfil Técnico</label>
                         <div className="grid grid-cols-2 gap-2">
                            {rolesTecnicos.map(r => (
                              <button 
                                key={r} 
                                onClick={() => setSelectedMember({ ...selectedMember, etiquetaTecnica: r })}
                                className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedMember.etiquetaTecnica === r ? 'bg-blue-500 text-white border-blue-400' : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/20'}`}
                              >
                                {r}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-10 flex-1">
                   <div className="flex items-center justify-between mb-8">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Acceso a Proyectos</label>
                      <div className="px-3 py-1 bg-zinc-950 rounded-full border border-white/5 text-[8px] font-black text-emerald-500 uppercase">Control de Perímetro</div>
                   </div>

                   <div className="space-y-3">
                      {projects.map(project => {
                        const hasAccess = selectedMember.proyectosAsignados.includes(project.id);
                        return (
                          <div 
                            key={project.id} 
                            onClick={() => toggleProjectAccess(selectedMember.id, project.id)}
                            className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${hasAccess ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950 border-white/5 hover:border-white/10'}`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${hasAccess ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-700'}`}>
                                   <Rocket size={18} />
                                </div>
                                <span className={`text-sm font-black uppercase tracking-tight ${hasAccess ? 'text-white' : 'text-zinc-600'}`}>{project.nombre}</span>
                             </div>
                             {hasAccess ? <CheckCircle2 className="text-emerald-500" size={22} /> : <Circle className="text-zinc-800" size={22} />}
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="p-10 bg-zinc-950/80 border-t border-white/5 flex gap-4">
                    <button onClick={() => setSelectedMember(null)} className="flex-1 py-4 bg-zinc-900 text-zinc-500 text-xs font-black uppercase rounded-2xl border border-white/5 hover:text-white transition-all">Cancelar</button>
                    <button onClick={handleSaveMember} className="flex-1 py-4 bg-emerald-600 text-white text-xs font-black uppercase rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all">Guardar Cambios</button>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};
