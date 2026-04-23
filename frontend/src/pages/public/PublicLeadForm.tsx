import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

export const PublicLeadForm = () => {
    const { tenantId, projectId } = useParams();
    const [formConfig, setFormConfig] = useState<any>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadForm = async () => {
            try {
                const url = projectId 
                    ? `${API_BASE}/api/Public/project-form/${projectId}`
                    : `${API_BASE}/api/Public/form/${tenantId}?tipo=lead`;
                    
                const res = await fetch(url);
                if (res.ok) {
                    setFormConfig(await res.json());
                }
            } finally {
                setLoading(false);
            }
        };
        loadForm();
    }, [tenantId, projectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = projectId
                ? `${API_BASE}/api/Public/project-lead/${projectId}`
                : `${API_BASE}/api/Public/lead/${tenantId}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(responses)
            });
            if (res.ok) {
                setSubmitted(true);
                Swal.fire({
                    title: '¡Recibido!',
                    text: 'Tus requerimientos han sido guardados en el ADN del proyecto.',
                    icon: 'success',
                    background: '#18181b',
                    color: '#fff'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <Loader2 className="text-emerald-500 animate-spin" size={48} />
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-emerald-500/20 p-6 rounded-full mb-8">
                <CheckCircle className="text-emerald-500" size={64} />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">¡Gracias por tu interés!</h1>
            <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                Hemos recibido tus requerimientos. Nuestro equipo de ingeniería los está analizando para darte la mejor solución técnica.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-50" />
                
                <header className="mb-10">
                    <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
                        Contanos tu <span className="text-emerald-500">Proyecto</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                        Respondé estas breves preguntas. Tu información será procesada por nuestro motor de ingeniería MateCode.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Nombre Completo</label>
                            <input 
                                required
                                onChange={(e) => setResponses({...responses, nombre: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                placeholder="Tu nombre..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Email de Contacto</label>
                            <input 
                                required
                                type="email"
                                onChange={(e) => setResponses({...responses, email: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    {formConfig?.configuracionJson?.map((q: any, idx: number) => (
                        <div key={idx}>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">{q.pregunta}</label>
                            {q.tipo_input === 'textarea' ? (
                                <textarea 
                                    required
                                    rows={4}
                                    onChange={(e) => setResponses({...responses, [q.etiqueta_semantica]: e.target.value})}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                />
                            ) : (
                                <input 
                                    required
                                    type={q.tipo_input}
                                    onChange={(e) => setResponses({...responses, [q.etiqueta_semantica]: e.target.value})}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                />
                            )}
                        </div>
                    ))}

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest text-sm rounded-3xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Send size={18} />
                                Enviar Requerimientos a MateCode
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
