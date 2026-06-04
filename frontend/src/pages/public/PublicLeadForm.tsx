import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

export const PublicLeadForm = () => {
    const { tenantId, projectId, agencyId } = useParams();
    const [searchParams] = useSearchParams();
    const formId = searchParams.get('formId');

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
                    : agencyId
                    ? `${API_BASE}/api/Public/agency-form/${agencyId}?tipo=lead${formId ? `&formId=${formId}` : ''}`
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
    }, [tenantId, projectId, agencyId, formId]);

    const normalizeConfig = (config: any) => {
        if (!config) {
            return {
                questions: [],
                emailVisible: true,
                emailRequired: true,
                telefonoVisible: false,
                telefonoRequired: false
            };
        }
        if (Array.isArray(config)) {
            return {
                questions: config,
                emailVisible: true,
                emailRequired: true,
                telefonoVisible: false,
                telefonoRequired: false
            };
        }
        return {
            questions: config.questions || [],
            emailVisible: config.emailVisible ?? true,
            emailRequired: config.emailRequired ?? true,
            telefonoVisible: config.telefonoVisible ?? false,
            telefonoRequired: config.telefonoRequired ?? false
        };
    };

    const normalized = normalizeConfig(formConfig?.configuracionJson);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = projectId
                ? `${API_BASE}/api/Public/project-lead/${projectId}`
                : agencyId
                ? `${API_BASE}/api/Public/agency-lead/${agencyId}`
                : `${API_BASE}/api/Public/lead/${tenantId}`;

            const payload = {
                ...responses,
                formTemplateId: formConfig?.id,
                esRespuestaFormulario: true
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setSubmitted(true);
                Swal.fire({
                    title: '¡Recibido!',
                    text: 'Tus requerimientos han sido guardados.',
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
                        {formConfig?.nombre || 'Contanos tu Proyecto'}
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                        Respondé estas preguntas clave. Tu información será procesada por nuestro motor de ingeniería MateCode.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos de contacto configurables */}
                    <div className="space-y-4 bg-zinc-950/20 p-5 rounded-2xl border border-zinc-850">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2 border-b border-zinc-800 pb-1.5">Datos de Contacto</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Nombre Completo <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    onChange={(e) => setResponses({...responses, nombre: e.target.value})}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-xs"
                                    placeholder="Tu nombre..."
                                />
                            </div>
                            
                            {normalized.emailVisible && (
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                                        Email de Contacto {normalized.emailRequired && <span className="text-red-500">*</span>}
                                    </label>
                                    <input 
                                        required={normalized.emailRequired}
                                        type="email"
                                        onChange={(e) => setResponses({...responses, email: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-xs"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            )}

                            {normalized.telefonoVisible && (
                                <div className="col-span-full">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                                        Teléfono de Contacto {normalized.telefonoRequired && <span className="text-red-500">*</span>}
                                    </label>
                                    <input 
                                        required={normalized.telefonoRequired}
                                        type="tel"
                                        onChange={(e) => setResponses({...responses, telefono: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-xs"
                                        placeholder="Ej: +54 9 11 1234-5678"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preguntas estructuradas */}
                    <div className="space-y-6">
                        {normalized.questions.map((q: any, idx: number) => {
                            const inputType = q.tipoInput || q.tipo_input || 'text';
                            const semanticTag = q.etiquetaSemantica || q.etiqueta_semantica;
                            return (
                                <div key={idx} className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                                        {q.pregunta}
                                    </label>
                                    {inputType === 'textarea' ? (
                                        <textarea 
                                            required
                                            rows={4}
                                            onChange={(e) => setResponses({...responses, [semanticTag]: e.target.value})}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-xs"
                                        />
                                    ) : inputType === 'select' ? (
                                        <select
                                            required
                                            onChange={(e) => setResponses({...responses, [semanticTag]: e.target.value})}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-xs focus:text-white"
                                        >
                                            <option value="">Seleccione una opción...</option>
                                            {q.opciones?.map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : inputType === 'checkbox' ? (
                                        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                                            {q.opciones?.map((opt: string) => {
                                                const currentValues = responses[semanticTag] || [];
                                                const isChecked = currentValues.includes(opt);
                                                return (
                                                    <label key={opt} className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300 hover:text-white">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                const nextValues = isChecked 
                                                                    ? currentValues.filter((v: string) => v !== opt)
                                                                    : [...currentValues, opt];
                                                                setResponses({...responses, [semanticTag]: nextValues});
                                                            }}
                                                            className="rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                                        />
                                                        <span>{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : inputType === 'linear_scale' ? (
                                        <div className="flex justify-between items-center gap-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                                            {[1, 2, 3, 4, 5].map(val => (
                                                <label key={val} className="flex flex-col items-center gap-1 cursor-pointer flex-1">
                                                    <input
                                                        type="radio"
                                                        name={semanticTag}
                                                        required
                                                        value={val}
                                                        checked={responses[semanticTag] === String(val)}
                                                        onChange={() => setResponses({...responses, [semanticTag]: String(val)})}
                                                        className="sr-only"
                                                    />
                                                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                                                        responses[semanticTag] === String(val)
                                                            ? 'bg-emerald-500 text-black border-emerald-500'
                                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                                    }`}>
                                                        {val}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : inputType === 'rating' ? (
                                        <div className="flex gap-2 p-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setResponses({...responses, [semanticTag]: String(star)})}
                                                    className={`text-3xl transition-colors ${
                                                        Number(responses[semanticTag] || 0) >= star ? 'text-amber-400' : 'text-zinc-750 hover:text-zinc-600'
                                                    }`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <input 
                                            required
                                            type={inputType}
                                            onChange={(e) => setResponses({...responses, [semanticTag]: e.target.value})}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-xs"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

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
