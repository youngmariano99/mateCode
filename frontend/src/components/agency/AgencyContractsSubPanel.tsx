import React, { useState, useEffect, useRef } from 'react';
import { useCrmStore, type Contract } from '../../store/useCrmStore';
import { Plus, Trash2, Edit, CheckCircle, ExternalLink, ArrowLeft, PenTool, Hash } from 'lucide-react';
import Swal from 'sweetalert2';

const TEMPLATE_CONTRATO_BASE = `# CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES

Conste por el presente documento, el Contrato de Prestación de Servicios de Diseño y Desarrollo de Software que celebran de una parte MateCode Argentina (en adelante la EMPRESA/AGENCIA) y de la otra parte el CLIENTE especificado en la carátula de este documento.

## CLAUSULAS GENERALES

### PRIMERA: OBJETO DEL CONTRATO
La EMPRESA se compromete a realizar los servicios de diseño UX/UI, maquetación frontend y desarrollo técnico backend del sitio web o aplicación acordada según el relevamiento inicial.

### SEGUNDA: PLAZOS Y ENTREGAS
El desarrollo se ejecutará de forma ágil siguiendo las fases del mapa de hitos. Cada entrega intermedia requerirá la conformidad del CLIENTE para proceder a la siguiente etapa.

### TERCERA: PROPIEDAD INTELECTUAL
Una vez cancelado el monto total del proyecto, la titularidad del código fuente y los recursos visuales del sitio web serán propiedad exclusiva del CLIENTE.

---
Firmado digitalmente por ambas partes en conformidad de los términos establecidos.
`;

export const AgencyContractsSubPanel: React.FC = () => {
  const { leads, fetchLeads, contracts, fetchContracts, createContract, updateContract, deleteContract, signContract } = useCrmStore();
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    id: '',
    clienteId: '',
    titulo: '',
    contenido: '',
    estado: 'Borrador'
  });

  // Canvas para firma
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchContracts();
  }, []);

  const handleCreateNew = () => {
    const firstClient = leads[0]?.id || '';
    setForm({
      id: '',
      clienteId: firstClient,
      titulo: 'Contrato de Servicios de Desarrollo Web - ' + (leads[0]?.nombre || ''),
      contenido: TEMPLATE_CONTRATO_BASE,
      estado: 'Borrador'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (c: Contract) => {
    setForm({
      id: c.id,
      clienteId: c.clienteId,
      titulo: c.titulo,
      contenido: c.contenido,
      estado: c.estado
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar contrato?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await deleteContract(id);
      Swal.fire({ title: 'Contrato eliminado', icon: 'success', background: '#09090b', color: '#f4f4f5' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.clienteId) {
        throw new Error('Debes seleccionar un cliente.');
      }
      if (!form.titulo.trim() || !form.contenido.trim()) {
        throw new Error('Título y contenido son requeridos.');
      }

      if (form.id) {
        await updateContract(form.id, {
          titulo: form.titulo,
          contenido: form.contenido,
          estado: form.estado
        });
      } else {
        await createContract({
          clienteId: form.clienteId,
          titulo: form.titulo,
          contenido: form.contenido,
          estado: form.estado
        });
      }

      setIsFormOpen(false);
      Swal.fire({ title: 'Contrato guardado', icon: 'success', background: '#09090b', color: '#f4f4f5' });
      fetchContracts();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#09090b', color: '#f4f4f5' });
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ffffff'; // Blanco contrastante sobre fondo zinc oscuro
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSignContract = async () => {
    if (!viewingContract) return;

    try {
      // Generar huella SHA-256 única
      const msgUint8 = new TextEncoder().encode(viewingContract.titulo + viewingContract.contenido + new Date().toISOString());
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const huellaCripto = 'mc_' + hashHex.substring(0, 32);

      await signContract(viewingContract.id, huellaCripto);
      setViewingContract({
        ...viewingContract,
        estado: 'Firmado',
        fechaFirma: new Date().toISOString(),
        huellaCriptografica: huellaCripto
      });

      Swal.fire({
        title: '¡Contrato Firmado!',
        text: `El acuerdo se ha cerrado con éxito. Huella: ${huellaCripto}`,
        icon: 'success',
        background: '#09090b',
        color: '#f4f4f5',
        confirmButtonColor: '#10b981'
      });
      fetchContracts();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {viewingContract ? (
        /* Realistic A4 Document Visualizer */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
            <button
              onClick={() => setViewingContract(null)}
              className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">Visualizador de Contrato</h2>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Acuerdo formal de desarrollo ágil de software</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Realistic A4 Sheet Wrapper */}
            <div className="bg-zinc-900 border border-zinc-850 p-1 rounded-2xl shadow-2xl w-full max-w-[800px] overflow-hidden">
              <div className="bg-white text-zinc-900 p-10 md:p-16 aspect-[1/1.41] shadow-inner select-text font-serif leading-relaxed text-xs md:text-sm space-y-6 overflow-y-auto max-h-[85vh]">
                <div className="flex justify-between items-start border-b border-zinc-350 pb-6 mb-6">
                  <div>
                    <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-950 mb-1">MATECODE ARGENTINA</h1>
                    <p className="text-[10px] text-zinc-500 font-sans uppercase font-bold tracking-widest">Ingeniería de Software & Diseño Web</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider font-bold font-sans bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
                      {viewingContract.estado}
                    </span>
                  </div>
                </div>

                <div className="text-center py-4 mb-4">
                  <h2 className="text-lg font-black uppercase text-zinc-950 font-sans tracking-tight">{viewingContract.titulo}</h2>
                  <p className="text-[10px] text-zinc-550 font-sans font-bold uppercase mt-1">
                    Cliente: {viewingContract.cliente?.nombre} ({viewingContract.cliente?.email})
                  </p>
                </div>

                <div className="whitespace-pre-wrap text-zinc-800 pr-1 leading-loose text-justify">
                  {viewingContract.contenido}
                </div>

                {viewingContract.estado === 'Firmado' && (
                  <div className="mt-12 pt-6 border-t border-dashed border-zinc-300 grid grid-cols-2 gap-6 text-zinc-800 font-sans">
                    <div className="space-y-1 bg-zinc-50 border border-zinc-200 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-emerald-500/5 rounded-full flex items-center justify-center text-emerald-500">
                        <CheckCircle size={24} />
                      </div>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Estado Legal</p>
                      <p className="text-xs font-black text-emerald-600 uppercase">Aprobado / Firmado</p>
                      <p className="text-[9px] text-zinc-500">Fecha: {new Date(viewingContract.fechaFirma || '').toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1 bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <Hash size={10} />
                        <span>Sello Criptográfico</span>
                      </p>
                      <p className="text-[10px] font-mono font-bold text-zinc-700 break-all">{viewingContract.huellaCriptografica}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Drawer Control Panel */}
            {viewingContract.estado !== 'Firmado' && (
              <div className="w-full lg:w-80 bg-zinc-900 border border-zinc-850 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <PenTool size={16} className="text-emerald-400" />
                  <span>Firma Digital Interactiva</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Dibuja tu firma con el ratón o en tu pantalla táctil como aceptación formal de los términos declarados.
                </p>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair bg-zinc-950 w-full"
                  />
                  <button
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[8px] font-bold text-zinc-400 uppercase rounded-md transition-colors"
                  >
                    Limpiar
                  </button>
                </div>

                <button
                  onClick={handleSignContract}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} />
                  <span>Firmar y Sellar Acuerdo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : isFormOpen ? (
        /* Creation / Edition Form */
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">
                {form.id ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
              </h2>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Redacción formal y asignación de clientes</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Cliente Asociado</label>
                <select
                  disabled={!!form.id}
                  value={form.clienteId}
                  onChange={e => setForm({ ...form, clienteId: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="">Selecciona un cliente...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.nombre} ({lead.email || 'Sin correo'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título del Contrato</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Contrato de Desarrollo E-Commerce"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Contenido de la Propuesta / Contrato</label>
              <textarea
                rows={15}
                value={form.contenido}
                onChange={e => setForm({ ...form, contenido: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold"
              >
                Guardar Contrato
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Contracts List */
        <div className="space-y-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contratos de la Agencia</h3>
              <p className="text-zinc-500 text-[10px] mt-0.5">Administra los documentos firmados y propuestas vigentes de tu empresa.</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Nuevo Contrato</span>
            </button>
          </div>

          {contracts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-zinc-850 rounded-2xl">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No hay contratos activos</p>
              <p className="text-[10px] text-zinc-650 mt-1">Crea un contrato para formalizar acuerdos y recibir firmas digitales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map(c => (
                <div key={c.id} className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        c.estado === 'Firmado'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {c.estado}
                      </span>
                      <div className="flex items-center gap-1">
                        {c.estado !== 'Firmado' && (
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{c.titulo}</h4>
                    <p className="text-[10px] text-zinc-550">Cliente: {c.cliente?.nombre ?? 'Cliente Cargado'}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-850">
                    <span className="text-[9px] text-zinc-600 font-bold">{new Date(c.fechaCreacion).toLocaleDateString()}</span>
                    <button
                      onClick={() => setViewingContract(c)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink size={10} />
                      <span>{c.estado === 'Firmado' ? 'Ver Contrato' : 'Firmar / Ver'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
