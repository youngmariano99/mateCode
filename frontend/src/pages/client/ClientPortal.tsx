import { useState } from 'react';
import { ClientLayout } from '../../layouts/ClientLayout';

export default function ClientPortal() {
  const [comment, setComment] = useState("");

  const submitFeedback = () => {
    alert("Feedback enviado directamente al tablero del equipo (Kanban). ¡Gracias!");
    setComment("");
  };

  return (
    <ClientLayout clientName="Consultora HR">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">Avance del Software</h2>
              
              <div className="mb-6 space-y-2">
                 <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span>Fase de Programación y Entrega</span>
                    <span className="text-indigo-600">65% Compl</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '65%' }}></div>
                 </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-slate-700 leading-relaxed">
                 <strong>Última novedad del equipo:</strong> "Ya terminamos de conectar la pasarela de pagos. Te dejamos acá una captura adjunta para que vayas viendo la estética del checkout final."
              </div>
           </div>
        </div>

        {/* Widget Feedback */}
        <div className="md:col-span-1">
           <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 sticky top-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 📬 Tus Comentarios
              </h3>
              <p className="text-xs text-slate-500 mt-2">Danos tu opinión sin vueltas. Nuestro equipo lo ve al instante y planifica el ajuste.</p>
              
              <textarea 
                rows={4}
                className="w-full mt-4 p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="Hola equipo, estuve probando el sistema y noté..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button 
                onClick={submitFeedback}
                className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                 Enviar Sugerencia
              </button>
           </div>
        </div>

      </div>
    </ClientLayout>
  );
}
