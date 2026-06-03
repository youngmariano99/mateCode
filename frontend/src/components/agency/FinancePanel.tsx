import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Building } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

interface FinancePanelProps {
  agencyWorkspaces: any[];
}

export const FinancePanel: React.FC<FinancePanelProps> = ({ agencyWorkspaces }) => {
  const { financeData, fetchFinanceDashboard, createTransaction, deleteTransaction } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: 'egreso',
    monto: '',
    concepto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    proyectoId: ''
  });

  useEffect(() => {
    fetchFinanceDashboard();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        tipo: form.tipo,
        monto: parseFloat(form.monto),
        concepto: form.concepto,
        descripcion: form.descripcion,
        fecha: form.fecha,
        categoria: form.categoria,
        proyectoId: form.proyectoId ? form.proyectoId : undefined
      });
      setIsModalOpen(false);
      setForm({
        tipo: 'egreso',
        monto: '',
        concepto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria: '',
        proyectoId: ''
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar transacción?',
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
      await deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Finanzas de la Agencia</h1>
          <p className="text-zinc-500 text-xs mt-1">Control consolidado de egresos, ingresos y balance neto mensual.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          <span>Cargar Transacción</span>
        </button>
      </div>

      {financeData && (
        <div className="space-y-8">
          {/* Grid de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ingresos Totales</span>
                <h3 className="text-xl font-bold text-white">${financeData.totalIngresos.toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Egresos Totales</span>
                <h3 className="text-xl font-bold text-white">${financeData.totalEgresos.toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Balance Neto</span>
                <h3 className={`text-xl font-bold ${financeData.balanceNeto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${financeData.balanceNeto.toFixed(2)}
                </h3>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center justify-center">
                <Building size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Costos Fijos</span>
                <h3 className="text-xl font-bold text-white">${financeData.totalCostosFijos.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          {/* Transacciones Recientes */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Registro de Transacciones</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-500 uppercase tracking-widest text-[9px] font-black">
                    <th className="pb-3">Concepto</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Categoría</th>
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3 text-right">Monto</th>
                    <th className="pb-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.transacciones.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-zinc-650">
                        No hay registros financieros para esta organización.
                      </td>
                    </tr>
                  ) : (
                    financeData.transacciones.map(tx => (
                      <tr key={tx.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-all">
                        <td className="py-3.5 font-medium text-white">{tx.concepto}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${
                            tx.tipo === 'ingreso' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {tx.tipo}
                          </span>
                        </td>
                        <td className="py-3.5 text-zinc-400">{tx.categoria || 'N/A'}</td>
                        <td className="py-3.5 text-zinc-500">{new Date(tx.fecha).toLocaleDateString()}</td>
                        <td className={`py-3.5 text-right font-bold font-mono ${
                          tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-zinc-200'
                        }`}>
                          ${tx.monto.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="text-zinc-650 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Cargar Movimiento de Caja</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Tipo de Movimiento</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="ingreso">Ingreso (Venta/Proyecto)</option>
                    <option value="egreso">Egreso General</option>
                    <option value="costo_fijo">Costo Fijo (SaaS/Hosting/Sueldo)</option>
                    <option value="costo_variable">Costo Variable</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Monto ($)</label>
                  <input required type="number" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Concepto</label>
                <input required type="text" placeholder="Ej: Pago de Hito 1, Hosting AWS" value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Categoría</label>
                <input type="text" placeholder="Ej: Infraestructura, Clientes, Servidores" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Fecha</label>
                  <input required type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Vincular a Espacio</label>
                  <select value={form.proyectoId} onChange={e => setForm({ ...form, proyectoId: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                    <option value="">Ninguno...</option>
                    {agencyWorkspaces.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Registrar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
