import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClientLayout } from '../../layouts/ClientLayout';
import { Send, CheckCircle2, Clock, MessageSquare, ExternalLink } from 'lucide-react';

export default function ClientMagicLink() {
    const { token } = useParams<{ token: string }>();
    const [project, setProject] = useState<any>(null);
    const [feedback, setFeedback] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // Mock: fetch(`/api/portal/proyecto/${token}`)
                setTimeout(() => {
                    setProject({
                        proyectoNombre: "Sistema de Gestión de Stock",
                        faseActual: "En Desarrollo",
                        clienteNombre: "Juan Pérez"
                    });
                    setLoading(false);
                }, 1000);
            } catch (err) { console.error(err); }
        };
        fetchProject();
    }, [token]);

    const handleFeedback = async () => {
        if (!feedback) return;
        setSent(true);
        // await fetch(`/api/portal/feedback/${token}`, { method: 'POST', body: JSON.stringify({ Comentario: feedback }) });
        setFeedback("");
        setTimeout(() => setSent(false), 3000);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-black uppercase text-zinc-300 tracking-[0.3em] animate-pulse">Iniciando Conexión Segura...</div>;

    return (
        <ClientLayout clientName={project?.clienteNombre}>
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Status Hero */}
                <div className="bg-white p-10 rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/50 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                        <Clock size={40} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tighter text-zinc-900 leading-none mb-2">
                            {project?.proyectoNombre}
                        </h2>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                {project?.faseActual}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium italic">Actualizado hace 2 horas</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Feedback Column */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                           
                           <div className="flex items-center gap-3 mb-6">
                               <MessageSquare className="text-emerald-500" size={20} />
                               <h3 className="text-lg font-black uppercase tracking-tight">Dejanos tu Feedback</h3>
                           </div>
                           
                           <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6">
                               ¿Tenés alguna duda o querés sugerir un cambio? Escribilo acá y le llega directo a nuestros programadores.
                           </p>

                           <textarea 
                             className="w-full h-32 bg-zinc-800 border-none rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none mb-4"
                             placeholder="Ej: Me gustaría cambiar el color del botón principal o agregar un campo de fecha..."
                             value={feedback}
                             onChange={(e) => setFeedback(e.target.value)}
                           />

                           <button 
                             onClick={handleFeedback}
                             disabled={sent}
                             className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${
                               sent ? 'bg-zinc-800 text-emerald-500' : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-900'
                             }`}
                           >
                               {sent ? <CheckCircle2 size={18} /> : <Send size={18} />}
                               {sent ? "Feedback Enviado" : "Enviar Comentario"}
                           </button>
                        </div>
                    </div>

                    {/* Progress Column */}
                    <div className="bg-white border border-zinc-200 p-8 rounded-3xl space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            Próximos Pasos
                        </h3>
                        
                        <div className="space-y-4">
                            {[
                                { t: "Validación de Requisitos", d: "Completado", c: true },
                                { t: "Diseño de Arquitectura", d: "Completado", c: true },
                                { t: "Implementación Core", d: "En Progreso", c: false },
                                { t: "Pruebas de Calidad", d: "Pendiente", c: false }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                                    <div className={`p-2 rounded-lg ${step.c ? 'bg-emerald-50 text-emerald-500' : 'bg-zinc-100 text-zinc-300'}`}>
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-zinc-800">{step.t}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{step.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
