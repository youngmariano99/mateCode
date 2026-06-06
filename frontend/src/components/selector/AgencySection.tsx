import React from 'react';
import { motion } from 'framer-motion';
import { Building, Layout, ChevronRight, Plus } from 'lucide-react';
import type { Agency } from '../../store/useAgencyStore';

interface AgencySectionProps {
  personalAgencies: Agency[];
  ownedAgencies: Agency[];
  invitedAgencies: Agency[];
  onSelectAgency: (agency: Agency) => Promise<void>;
  onEnterDashboard: (agency: Agency) => void;
  onCreateAgency: () => Promise<void>;
}

export const AgencySection: React.FC<AgencySectionProps> = ({
  personalAgencies,
  ownedAgencies,
  invitedAgencies,
  onSelectAgency,
  onEnterDashboard,
  onCreateAgency,
}) => {
  return (
    <div className="space-y-8">
      {/* Sección 1: Espacio Personal */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest pb-1.5 border-b border-zinc-900">
          1. Tu Espacio Personal (Sandbox)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalAgencies.map((agency, index) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="group relative flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
              <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-850 group-hover:border-zinc-800 p-5 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[170px]">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      <Building size={18} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-zinc-800/80 text-zinc-400 border-zinc-700">
                      Personal
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                    {agency.nombre}
                  </h3>
                  <p className="text-[10px] text-zinc-500">Espacio de trabajo local para pruebas e ideas rápidas.</p>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => onSelectAgency(agency)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Cargar Espacios de Trabajo</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sección 2: Tus Organizaciones Creadas */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest pb-1.5 border-b border-zinc-900">
          2. Tus Empresas / Agencias (Propias)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ownedAgencies.map((agency, index) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="group relative flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
              <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-850 group-hover:border-zinc-800 p-5 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition-colors">
                      <Building size={18} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Empresa
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                    {agency.nombre}
                  </h3>
                </div>

                <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => onSelectAgency(agency)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Ver Espacios de Trabajo</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    onClick={() => onEnterDashboard(agency)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-355 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Layout size={13} className="text-indigo-400" />
                    <span>Dashboard Corporativo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Card Crear Agencia */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={onCreateAgency}
            className="cursor-pointer border border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all bg-zinc-900/10 h-[180px]"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-805 flex items-center justify-center mb-3">
              <Plus size={20} />
            </div>
            <span className="font-bold uppercase tracking-widest text-[9px]">Cimentar Nueva Organización</span>
          </motion.div>
        </div>
      </div>

      {/* Sección 3: Organizaciones Invitadas */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest pb-1.5 border-b border-zinc-900">
          3. Organizaciones de Terceros (Invitado)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitedAgencies.map((agency, index) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="group relative flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity rounded-3xl" />
              <div className="relative bg-zinc-900/50 backdrop-blur-md border border-zinc-850 group-hover:border-zinc-800 p-5 rounded-3xl transition-all h-full flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition-colors">
                      <Building size={18} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      Invitado
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-1 group-hover:text-emerald-400 transition-colors">
                    {agency.nombre}
                  </h3>
                </div>

                <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => onSelectAgency(agency)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Ver Espacios de Trabajo</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    onClick={() => onEnterDashboard(agency)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-355 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Layout size={13} className="text-indigo-400" />
                    <span>Dashboard Corporativo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {invitedAgencies.length === 0 && (
            <div className="col-span-2 p-8 border border-dashed border-zinc-855 text-center rounded-3xl text-zinc-650 text-xs flex flex-col items-center justify-center gap-1 min-h-[140px] bg-zinc-950/20">
              <span>No formas parte de organizaciones externas.</span>
              <span className="text-[10px] text-zinc-600">Proporciona tu email a tus socios para que te inviten.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
