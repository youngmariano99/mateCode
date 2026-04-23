import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/apiClient';
import { 
  Briefcase, 
  Users, 
  Zap 
} from 'lucide-react';

interface DashboardSummary {
  activeProjects: number;
  pendingLeads: number;
  teamMembers: number;
}

export default function Dashboard() {
  const { tenantId } = useProject();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!tenantId) return;
      try {
        setLoading(true);
        const data = await api.get('/Dashboard/summary');
        setSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [tenantId]);

  const cards = [
    {
      name: 'Proyectos Activos',
      value: summary?.activeProjects || 0,
      icon: Briefcase,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      name: 'Leads Pendientes',
      value: summary?.pendingLeads || 0,
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      name: 'Miembros del Equipo',
      value: summary?.teamMembers || 0,
      icon: Users,
      color: 'bg-indigo-500/10 text-indigo-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard General 🧉</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Estado actual de tu ecosistema de desarrollo y ventas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.name}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? '...' : card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center p-6 text-center">
          <p className="text-slate-400 text-sm max-w-xs">
            Próximamente: Gráficos de entrega continua y salud de sprints (Fase 3).
          </p>
        </div>
        <div className="h-64 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center p-6 text-center">
          <p className="text-slate-400 text-sm max-w-xs">
            Próximamente: Pipeline de CRM y conversión de Leads.
          </p>
        </div>
      </div>
    </div>
  );
}
