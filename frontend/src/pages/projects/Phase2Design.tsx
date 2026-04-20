import { useState } from 'react';
import { DiagramWorkspace } from '../../components/design/DiagramWorkspace';
import { QuoteWizardModal } from '../../components/finance/QuoteWizardModal';

export default function Phase2Design() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Arquitectura y Contrato</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
            Definí el "Cómo" modelando la base de datos visualmente. Al terminar, generá el presupuesto exacto basándote en la Fase 1.
          </p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md text-sm shadow-sm transition">
             💾 Guardar Stack en la Bóveda
           </button>
           <button 
             onClick={() => setIsQuoteModalOpen(true)}
             className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-sm shadow-sm transition"
           >
             Generar Presupuesto 💰
           </button>
        </div>
      </div>

      {/* Lienzo Bidireccional Split-View */}
      <DiagramWorkspace />

      {/* Modal Independiente Presupuestador */}
      {isQuoteModalOpen && <QuoteWizardModal onClose={() => setIsQuoteModalOpen(false)} />}
    </>
  );
}
