import React, { useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';

export const AuditPanel: React.FC = () => {
  const { auditLogs, fetchAuditLogs } = useOperationsStore();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Registro de Auditoría Inmutable</span>
            <ShieldAlert size={24} className="text-indigo-400" />
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Bitácora transparente del sistema. Monitorea accesos a credenciales y configuraciones críticas.</p>
        </div>
        <button 
          onClick={fetchAuditLogs}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-850 transition-all text-zinc-400 hover:text-white"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 flex-1">
        <div className="overflow-x-auto max-h-[600px] neon-scrollbar pr-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 uppercase tracking-widest text-[9px] font-black pb-3">
                <th className="pb-3">Fecha (UTC)</th>
                <th className="pb-3">Operador</th>
                <th className="pb-3">Módulo</th>
                <th className="pb-3">Acción</th>
                <th className="pb-3">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-650">
                    No se registran actividades en el historial.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/20">
                    <td className="py-3 text-zinc-500 font-mono">{new Date(log.fecha).toLocaleString()}</td>
                    <td className="py-3 font-bold text-zinc-200">{log.nombre_usuario || 'N/A'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-850 border border-zinc-800 text-[10px] text-indigo-400 font-bold">
                        {log.modulo}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                        log.accion === 'LEER_ACCESO' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/25' 
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400 font-mono text-[10px] max-w-xs truncate">
                      {JSON.stringify(log.detalles)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
