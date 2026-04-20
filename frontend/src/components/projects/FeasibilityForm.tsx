import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProject } from '../../context/ProjectContext';
import Swal from 'sweetalert2';
import { 
  CheckCircle2, 
  Save, 
  Rocket, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap,
  Info,
  Loader2
} from 'lucide-react';

interface FeasibilityFormData {
  definicion_problema: string;
  mapa_impacto: string;
  usuarios_contexto: string;
  procesos_actuales: string;
  objetivo_software: string;
  criterios_exito: string;
  restricciones_iniciales: string;
  nivel_prioridad: 'critico' | 'importante' | 'accesorio';
  vision_crecimiento: 'mvp' | 'escalable';
}

export const FeasibilityForm = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { tenantId } = useProject();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';
  
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FeasibilityFormData>({
    mode: 'onChange',
    defaultValues: {
      nivel_prioridad: 'importante',
      vision_crecimiento: 'mvp'
    }
  });

  const onSubmit = async (data: FeasibilityFormData) => {
    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`${API_BASE}/api/Project/${projectId}/feasibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Id': tenantId || ''
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al consolidar el ADN');

      setShowSuccess(true);
      
      Swal.fire({
        title: '¡ADN Consolidado! 🧬',
        text: 'Transformamos tu idea en un objeto de ingeniería. Ahora vamos a por los requisitos.',
        icon: 'success',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Despegar a Fase 1 🚀',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/projects/${projectId}/phase-1-requirements`);
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Se nos lavó el mate',
        text: 'Hubo un error al intentar guardar el ADN. Revisá tu conexión o reintentá en unos minutos.',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#10b981'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- BANNER DE ÉXITO --- */}
      {showSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in zoom-in duration-500">
          <div className="bg-emerald-500 p-3 rounded-full shadow-lg shadow-emerald-500/40">
            <CheckCircle2 className="text-white h-8 w-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter italic">¡Excelente! Este es el ADN de tu proyecto.</h2>
            <p className="text-zinc-400 text-sm mt-1 font-medium italic">
              Con toda esta info, en la Fase 1 te voy a armar un prompt perfecto para que la IA te genere el esqueleto del software en segundos. 
            </p>
          </div>
          <button 
            onClick={() => navigate(`/projects/${projectId}/phase-1-requirements`)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-500/20"
          >
            <Rocket size={18} />
            Despegar a Fase 1
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- FORMULARIO PRINCIPAL --- */}
        <form 
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* Indicador de Compleción */}
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
             <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${isValid ? '100%' : '40%'}` }}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {/* Campo 1 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">1. Definición del Problema</label>
              <textarea 
                {...register("definicion_problema", { required: true })}
                rows={3}
                placeholder="Ej: El cliente no sabe cuánto stock tiene y pierde ventas por no tenerlo actualizado."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Campo 2 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">2. Mapa de Impacto</label>
              <textarea 
                {...register("mapa_impacto", { required: true })}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Campo 3 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">3. Usuarios y Contexto</label>
              <textarea 
                {...register("usuarios_contexto", { required: true })}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Campo 4 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">4. Procesos Actuales</label>
              <textarea 
                {...register("procesos_actuales", { required: true })}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Campo 5 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">5. Objetivo del Software</label>
              <textarea 
                {...register("objetivo_software", { required: true })}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Campo 6 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">6. Criterios de Éxito (KPIs)</label>
              <textarea 
                {...register("criterios_exito", { required: true })}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Campo 7 */}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">7. Restricciones Iniciales</label>
              <textarea 
                {...register("restricciones_iniciales", { required: true })}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            {/* Campo 8 y 9 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">8. Nivel de Prioridad</label>
              <select 
                {...register("nivel_prioridad")}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-all cursor-pointer font-bold"
              >
                <option value="critico">Crítico (Dolor extremo)</option>
                <option value="importante">Importante (Escalabilidad)</option>
                <option value="accesorio">Accesorio (Nice to have)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">9. Visión de Crecimiento</label>
              <select 
                {...register("vision_crecimiento")}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 transition-all cursor-pointer font-bold"
              >
                <option value="mvp">MVP Puntual</option>
                <option value="escalable">Plataforma Escalable</option>
              </select>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs py-5 px-12 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 group"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                  Guardar ADN del Proyecto 🧬
                </>
              )}
            </button>
          </div>
        </form>

        {/* --- PANEL LATERAL DE ESTÁNDARES --- */}
        <aside className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ShieldCheck className="text-emerald-500 h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-xs uppercase tracking-tighter">Estándares MateCode</h3>
            </div>
            
            <p className="text-[11px] text-zinc-500 font-medium mb-6 leading-relaxed italic">
              "Configurar esto una vez significa que la IA nunca más te va a preguntar qué tecnologías usas o cómo querés el código."
            </p>

            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <Layers className="text-zinc-600 h-4 w-4 mt-0.5" />
                <div>
                   <h4 className="text-[10px] font-black text-zinc-300 uppercase italic">Clean Architecture</h4>
                   <p className="text-[10px] text-zinc-600 font-medium">Separación estricta de capas.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-zinc-600 h-4 w-4 mt-0.5" />
                <div>
                   <h4 className="text-[10px] font-black text-zinc-300 uppercase italic">SOLID & Patrones</h4>
                   <p className="text-[10px] text-zinc-600 font-medium">Inyección de dependencias implícita.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Cpu className="text-zinc-600 h-4 w-4 mt-0.5" />
                <div>
                   <h4 className="text-[10px] font-black text-zinc-300 uppercase italic">QA & BDD</h4>
                   <p className="text-[10px] text-zinc-600 font-medium">Checklist automatizado por defecto.</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 p-4 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <Info size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Dato Pro</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal italic font-medium">
                Al guardar, inyectamos automáticamente +20 reglas de ingeniería Clean Code en tu perfil.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
