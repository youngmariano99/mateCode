import React from 'react';
import { LayoutDashboard, Users, Database, LogOut, Briefcase, Rocket, Brain } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

export const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { tenantId, isLoading } = useProject();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !tenantId) {
      navigate('/workspace-selector');
    }
  }, [tenantId, isLoading, navigate]);

  if (isLoading || !tenantId) return null;

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'CRM & Leads', path: '/app/crm/leads', icon: Briefcase },
    { label: 'Mis Proyectos', path: '/app/projects', icon: Rocket },
    { label: 'Mi Equipo', path: '/app/team', icon: Users },
    { label: 'La Bóveda', path: '/app/vault', icon: Database },
    { label: 'Biblioteca Prompts', path: '/app/vault/prompts', icon: Brain },
    { label: 'Mi Portfolio', path: '/app/portfolio', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans selection:bg-emerald-500/30 selection:text-emerald-500">
      {/* Sidebar Tech */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            MateCode <span className="text-emerald-500">🧉</span>
          </h1>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-l-2 border-emerald-500 rounded-l-none'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
           <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-md p-3">
              <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 tracking-widest mb-1">Status</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Yerba cargada.</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar Modern */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 justify-between shrink-0 shadow-sm shadow-zinc-200/50 dark:shadow-none">
          <div className="flex items-center gap-2">
            <button 
                onClick={() => navigate('/workspace-selector')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-widest"
            >
                <Briefcase size={14} className="text-emerald-500" />
                Cambiar Mundo
            </button>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <LogOut size={16} strokeWidth={1.5} />
            Cerrar Sesión
          </button>
        </header>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-zinc-50/50 dark:bg-zinc-950">
          {children}
        </div>
      </main>
    </div>
  );
};
