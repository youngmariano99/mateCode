import React, { useRef, useState } from 'react';
import { ArrowLeft, Printer, CheckCircle, Hash, PenTool, History } from 'lucide-react';
import Swal from 'sweetalert2';

interface ContractVisualizerProps {
  contract: any;
  onBack: () => void;
  history: any[];
  targetLabel: string;
  onSignContract: (huella: string) => Promise<void>;
}

export const ContractVisualizer: React.FC<ContractVisualizerProps> = ({
  contract,
  onBack,
  history,
  targetLabel,
  onSignContract
}) => {
  // Canvas for signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
    ctx.strokeStyle = '#ffffff';
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
    try {
      const msgUint8 = new TextEncoder().encode(contract.titulo + contract.contenido + new Date().toISOString());
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const huellaCripto = 'mc_' + hashHex.substring(0, 32);

      await onSignContract(huellaCripto);
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#09090b', color: '#f4f4f5' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Visualizador de Contrato</h2>
            <p className="text-zinc-550 text-[10px] uppercase tracking-wider">Acuerdo formal de la agencia</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
        >
          <Printer size={12} />
          <span>Imprimir / PDF</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* A4 Sheet Wrapper */}
        <div className="bg-zinc-900 border border-zinc-850 p-1 rounded-2xl shadow-2xl w-full max-w-[800px] overflow-hidden">
          <div className="bg-white text-zinc-900 p-10 md:p-16 aspect-[1/1.41] shadow-inner select-text font-serif leading-relaxed text-xs md:text-sm space-y-6 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-zinc-350 pb-6 mb-6">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-950 mb-1">MATECODE ARGENTINA</h1>
                <p className="text-[10px] text-zinc-500 font-sans uppercase font-bold tracking-widest">Ingeniería de Software & Diseño Web</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider font-bold font-sans bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
                  {contract.estado}
                </span>
              </div>
            </div>

            <div className="text-center py-4 mb-4">
              <h2 className="text-lg font-black uppercase text-zinc-950 font-sans tracking-tight">{contract.titulo}</h2>
              <p className="text-[10px] text-zinc-550 font-sans font-bold uppercase mt-1">
                {targetLabel}
              </p>
            </div>

            <div className="whitespace-pre-wrap text-zinc-800 pr-1 leading-loose text-justify">
              {contract.contenido}
            </div>

            {contract.estado === 'Firmado' && (
              <div className="mt-12 pt-6 border-t border-dashed border-zinc-300 grid grid-cols-2 gap-6 text-zinc-800 font-sans">
                <div className="space-y-1 bg-zinc-50 border border-zinc-200 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-emerald-500/5 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle size={24} />
                  </div>
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Estado Legal</p>
                  <p className="text-xs font-black text-emerald-600 uppercase">Aprobado / Firmado</p>
                  <p className="text-[9px] text-zinc-550">Fecha: {new Date(contract.fechaFirma || '').toLocaleDateString()}</p>
                </div>
                <div className="space-y-1 bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Hash size={10} />
                    <span>Sello Criptográfico</span>
                  </p>
                  <p className="text-[10px] font-mono font-bold text-zinc-700 break-all">{contract.huellaCriptografica}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar audit and sign controls */}
        <div className="w-full lg:w-80 space-y-6">
          {contract.estado !== 'Firmado' && (
            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <PenTool size={16} className="text-emerald-400" />
                <span>Firma Digital Interactiva</span>
              </div>
              <p className="text-[10px] text-zinc-550 leading-normal">
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
                  className="absolute top-2 right-2 px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-805 border border-zinc-800 text-[8px] font-bold text-zinc-400 uppercase rounded-md transition-colors"
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

          {/* Version audit history timeline */}
          <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <History size={16} className="text-purple-400" />
              <span>Historial de Auditoría</span>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto neon-scrollbar pr-1">
              {history.length === 0 ? (
                <p className="text-[10px] text-zinc-550 italic">No hay modificaciones registradas.</p>
              ) : (
                history.map((h, i) => (
                  <div key={h.id || i} className="border-l-2 border-purple-500/30 pl-3 py-1 space-y-1 relative">
                    <div className="w-2 h-2 rounded-full bg-purple-500 absolute -left-[5px] top-2" />
                    <p className="text-[10px] font-bold text-white">{h.nombreUsuario || 'Usuario'}</p>
                    <p className="text-[9px] text-zinc-400 font-medium">el {new Date(h.fechaCambio).toLocaleString()}</p>
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: 'Visualización de Auditoría',
                          html: `<pre class="text-left text-xs bg-zinc-950 p-4 rounded-xl overflow-x-auto text-zinc-300 max-h-[350px] whitespace-pre-wrap font-mono">${h.contenidoAnterior}</pre>`,
                          confirmButtonColor: '#a855f7',
                          background: '#09090b',
                          color: '#fff'
                        });
                      }}
                      className="text-[8px] text-purple-400 hover:text-purple-300 font-bold uppercase cursor-pointer"
                    >
                      Ver versión anterior
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
