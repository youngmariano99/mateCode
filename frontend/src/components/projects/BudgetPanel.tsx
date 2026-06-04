import React, { useState, useEffect } from 'react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useAgencyStore } from '../../store/useAgencyStore';
import Swal from 'sweetalert2';
import { Plus, Trash2, Printer, Save, FileText, DollarSign, Calculator, Calendar } from 'lucide-react';

interface BudgetPanelProps {
  projectId: string;
}

interface ScopeItem {
  id: string;
  concepto: string;
  descripcion: string;
  horas: number;
  tarifaHora: number;
  monto: number;
}

export const BudgetPanel: React.FC<BudgetPanelProps> = ({ projectId }) => {
  const { budgets, fetchBudgets, saveBudget, loading } = useBudgetStore();
  const { activeAgency } = useAgencyStore();

  const [activeBudget, setActiveBudget] = useState<any>(null);
  
  // Quote general details
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [quoteNumber, setQuoteNumber] = useState('');

  // Item form state
  const [items, setItems] = useState<ScopeItem[]>([]);
  const [newConcepto, setNewConcepto] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newHoras, setNewHoras] = useState<number>(0);
  const [newTarifa, setNewTarifa] = useState<number>(0);
  const [newMonto, setNewMonto] = useState<number>(0);

  // Load budgets on mount
  useEffect(() => {
    if (projectId) {
      fetchBudgets(projectId);
    }
  }, [projectId]);

  // Set active budget once budgets are loaded
  useEffect(() => {
    if (budgets && budgets.length > 0) {
      const budget = budgets[0];
      setActiveBudget(budget);
      
      const parsed = typeof budget.alcanceJson === 'string' 
        ? JSON.parse(budget.alcanceJson) 
        : budget.alcanceJson || {};
        
      setItems(parsed.items || []);
      setClientName(parsed.clientName || '');
      setNotes(parsed.notes || '');
      setExpiryDays(parsed.expiryDays || 30);
      setQuoteNumber(parsed.quoteNumber || `COT-${projectId.slice(0, 5).toUpperCase()}`);
    } else {
      setActiveBudget(null);
      setItems([]);
      setClientName('');
      setNotes('');
      setExpiryDays(30);
      setQuoteNumber(`COT-${projectId.slice(0, 5).toUpperCase()}`);
    }
  }, [budgets]);

  // Auto calculate item amount if hours and rate change
  useEffect(() => {
    if (newHoras > 0 && newTarifa > 0) {
      setNewMonto(newHoras * newTarifa);
    }
  }, [newHoras, newTarifa]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcepto.trim()) return;

    const newItem: ScopeItem = {
      id: Math.random().toString(36).substring(2, 9),
      concepto: newConcepto,
      descripcion: newDescripcion,
      horas: newHoras,
      tarifaHora: newTarifa,
      monto: newMonto || (newHoras * newTarifa) || 0
    };

    setItems([...items, newItem]);
    
    // Clear form
    setNewConcepto('');
    setNewDescripcion('');
    setNewHoras(0);
    setNewTarifa(0);
    setNewMonto(0);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + Number(item.monto), 0);
  };

  const handleSaveBudget = async () => {
    const total = calculateTotal();
    const payload = {
      id: activeBudget?.id,
      proyectoId: projectId,
      perfilId: activeAgency?.id || '00000000-0000-0000-0000-000000000000',
      alcanceJson: {
        items,
        clientName,
        notes,
        expiryDays,
        quoteNumber
      },
      montoTotal: total
    };

    try {
      await saveBudget(payload);
      Swal.fire({
        title: '¡Presupuesto Guardado!',
        text: 'La cotización se ha guardado correctamente en la base de datos.',
        icon: 'success',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#10b981'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el presupuesto.',
        icon: 'error',
        background: '#18181b',
        color: '#fff'
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + expiryDays);
  const formattedDueDate = dueDate.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* CSS overrides for clean premium print layouts */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0d0d0d !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            display: block !important;
            background: #ffffff !important;
            color: #0d0d0d !important;
            padding: 2.5cm !important;
            min-height: 100vh;
            font-family: 'Inter', sans-serif !important;
          }
          .print-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-table th {
            background-color: #f4f4f5 !important;
            color: #09090b !important;
            border-bottom: 2px solid #e4e4e7 !important;
          }
          .print-table td {
            border-bottom: 1px solid #e4e4e7 !important;
            color: #27272a !important;
          }
          .print-total {
            border-top: 2px solid #09090b !important;
            background-color: #f4f4f5 !important;
          }
        }
      `}</style>

      {/* Editor Panel (no-print) */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left column: Quote metadata form */}
        <div className="xl:col-span-1 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Metadatos</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Datos del presupuesto y cliente</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Código de Cotización</label>
              <input
                type="text"
                value={quoteNumber}
                onChange={e => setQuoteNumber(e.target.value)}
                placeholder="COT-001"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Cliente / Razón Social</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Nombre o empresa del cliente"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Validez de Oferta (Días)</label>
              <div className="relative">
                <input
                  type="number"
                  value={expiryDays}
                  onChange={e => setExpiryDays(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">días</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Notas / Condiciones Especiales</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Términos de pago, plazos de entrega..."
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right column: Items & Calculator */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <Calculator size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Ítems de Cotización</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Calculadora de servicios y costos</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all border border-white/5 flex items-center gap-2"
                title="Imprimir / Exportar a PDF"
              >
                <Printer size={16} />
                <span className="text-xs font-bold uppercase">Exportar</span>
              </button>
              <button
                onClick={handleSaveBudget}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-2"
              >
                <Save size={16} />
                <span className="text-xs font-bold uppercase">Guardar</span>
              </button>
            </div>
          </div>

          {/* Add item form */}
          <form onSubmit={handleAddItem} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-850 space-y-4">
            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Añadir Servicio a Cotización</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Concepto / Servicio</label>
                <input
                  type="text"
                  value={newConcepto}
                  onChange={e => setNewConcepto(e.target.value)}
                  placeholder="Ej: Maquetación CSS & Maqueta Responsiva"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Costo Fijo (U$D)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">$</span>
                  <input
                    type="number"
                    value={newMonto || ''}
                    onChange={e => setNewMonto(Number(e.target.value))}
                    placeholder="Monto"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-6 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Descripción Detallada</label>
                <input
                  type="text"
                  value={newDescripcion}
                  onChange={e => setNewDescripcion(e.target.value)}
                  placeholder="Detalles sobre lo entregado..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Horas</label>
                  <input
                    type="number"
                    value={newHoras || ''}
                    onChange={e => setNewHoras(Number(e.target.value))}
                    placeholder="Hrs"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Tarifa (hr)</label>
                  <input
                    type="number"
                    value={newTarifa || ''}
                    onChange={e => setNewTarifa(Number(e.target.value))}
                    placeholder="$/hr"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-zinc-850 hover:bg-zinc-800 text-emerald-400 rounded-xl transition-all border border-emerald-500/20 text-xs font-black uppercase"
              >
                <Plus size={14} />
                Añadir Ítem
              </button>
            </div>
          </form>

          {/* Scope Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="text-[9px] font-black text-zinc-500 uppercase pb-3 tracking-widest pl-2">Servicio</th>
                  <th className="text-[9px] font-black text-zinc-500 uppercase pb-3 tracking-widest text-center hidden md:table-cell">Cálculo</th>
                  <th className="text-[9px] font-black text-zinc-500 uppercase pb-3 tracking-widest text-right">Subtotal</th>
                  <th className="text-[9px] font-black text-zinc-500 uppercase pb-3 tracking-widest text-center w-12">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-zinc-600 font-bold uppercase text-xs">
                      No hay ítems en la cotización comercial.
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="border-b border-zinc-850 hover:bg-zinc-950/20 transition-all">
                      <td className="py-4 pl-2">
                        <p className="text-sm font-bold text-white">{item.concepto}</p>
                        <p className="text-xs text-zinc-500 mt-1">{item.descripcion}</p>
                      </td>
                      <td className="py-4 text-center text-xs text-zinc-400 hidden md:table-cell">
                        {item.horas > 0 ? `${item.horas}hs × U$D ${item.tarifaHora}` : 'Costo Fijo'}
                      </td>
                      <td className="py-4 text-right text-sm font-black text-white pr-2">
                        U$D {Number(item.monto).toLocaleString()}
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 hover:bg-red-500/10 hover:text-red-400 text-zinc-600 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {/* Total Row */}
                {items.length > 0 && (
                  <tr className="bg-zinc-950/40 border-t border-zinc-800">
                    <td colSpan={2} className="py-5 pl-4 text-sm font-black text-zinc-400 uppercase tracking-widest hidden md:table-cell">
                      Importe Estimado Total
                    </td>
                    <td className="py-5 pl-4 text-sm font-black text-zinc-400 uppercase tracking-widest md:hidden">
                      Total
                    </td>
                    <td className="py-5 text-right text-xl font-black text-emerald-500 pr-2">
                      U$D {calculateTotal().toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Printable Area (visible under @media print or hidden/shown) */}
      <div className="print-container hidden xl:block bg-zinc-900 border border-zinc-800 rounded-[2rem] p-12 max-w-[800px] mx-auto print-card">
        {/* Quote Header */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-zinc-800 pb-8 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              {activeAgency?.nombre || 'MATECODE'}
            </h1>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">
              Propuesta Técnica & Cotización Comercial
            </p>
            {activeAgency?.redes_sociales?.email && (
              <p className="text-xs text-zinc-400 mt-2 font-medium">Contacto: {activeAgency.redes_sociales.email}</p>
            )}
          </div>
          <div className="text-right">
            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">
              Presupuesto Oficial
            </span>
            <p className="text-2xl text-zinc-200 font-bold uppercase tracking-tighter mt-3">{quoteNumber}</p>
            <p className="text-xs text-zinc-500 font-bold uppercase mt-1">Fecha Emisión: {formattedDate}</p>
          </div>
        </div>

        {/* Client & Expiry info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-zinc-850">
          <div>
            <h5 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Preparado Para:</h5>
            <p className="text-xl font-black text-white">{clientName || 'Cliente No Especificado'}</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Ref Proyecto: {projectId.slice(0, 8)}</p>
          </div>
          <div className="text-left md:text-right">
            <h5 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Validez de Propuesta:</h5>
            <p className="text-sm font-bold text-zinc-300">Hasta el {formattedDueDate}</p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">({expiryDays} días de validez comercial)</p>
          </div>
        </div>

        {/* Print Table */}
        <div className="py-8">
          <table className="w-full border-collapse print-table">
            <thead>
              <tr className="border-b border-zinc-800 text-left bg-zinc-950/30">
                <th className="text-[10px] font-black text-zinc-400 uppercase p-3 tracking-widest pl-4">Descripción del Entregable</th>
                <th className="text-[10px] font-black text-zinc-400 uppercase p-3 tracking-widest text-center">Esfuerzo</th>
                <th className="text-[10px] font-black text-zinc-400 uppercase p-3 tracking-widest text-right pr-4">Total (U$D)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-zinc-500 text-xs font-bold uppercase italic">
                    Sin entregables cargados.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b border-zinc-850 hover:bg-zinc-950/10">
                    <td className="p-4 pl-4">
                      <p className="text-sm font-bold text-white">{item.concepto}</p>
                      <p className="text-xs text-zinc-400 mt-1 font-medium">{item.descripcion}</p>
                    </td>
                    <td className="p-4 text-center text-xs text-zinc-400">
                      {item.horas > 0 ? `${item.horas}hs × U$D ${item.tarifaHora}` : 'Costo Fijo'}
                    </td>
                    <td className="p-4 text-right text-sm font-black text-white pr-4">
                      U$D {Number(item.monto).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
              {/* Grand Total */}
              {items.length > 0 && (
                <tr className="bg-zinc-950 border-t-2 border-zinc-800 print-total">
                  <td colSpan={2} className="p-5 pl-4 text-xs font-black text-zinc-400 uppercase tracking-widest">
                    Importe Total Neto Acordado
                  </td>
                  <td className="p-5 text-right text-2xl font-black text-emerald-500 pr-4">
                    U$D {calculateTotal().toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        {notes && (
          <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-850 space-y-2 mt-4">
            <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} className="text-emerald-500" />
              Términos, Cláusulas y Condiciones Comerciales
            </h5>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium whitespace-pre-line">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
