import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiClient';
import Swal from 'sweetalert2';
import { Save, Loader2, Palette, Shield, Info, Layout } from 'lucide-react';

interface BriefingPanelProps {
  projectId: string;
}

export const BriefingPanel: React.FC<BriefingPanelProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);

  // Identity Form States
  const [identity, setIdentity] = useState({
    name: '',
    purpose: '',
    slogan: '',
    personality: ''
  });

  // Visuals Form States
  const [visuals, setVisuals] = useState({
    primaryHex: '#10b981',
    secondaryHex: '#3b82f6',
    accentHex: '#f59e0b',
    backgroundHex: '#09090b',
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    numberFont: 'JetBrains Mono',
    imageStyle: 'Minimalist'
  });

  // Layout Rules States
  const [layoutRules, setLayoutRules] = useState({
    navbar_style: 'sticky',
    footer_style: 'standard'
  });

  // Voice/Tone States
  const [voice, setVoice] = useState({
    tone: 'Professional',
    prohibited_words: [] as string[],
    slang_allowed: false
  });

  const [rawProhibitedWords, setRawProhibitedWords] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/Project/${projectId}`);
        setProject(data);
        const ctx = data.contextoJson || {};
        
        // Parse branding
        const branding = ctx.branding || {};
        
        setIdentity({
          name: branding.identity?.name || data.nombre || '',
          purpose: branding.identity?.purpose || '',
          slogan: branding.identity?.slogan || '',
          personality: branding.identity?.personality || ''
        });

        setVisuals({
          primaryHex: branding.visuals?.primaryHex || '#10b981',
          secondaryHex: branding.visuals?.secondaryHex || '#3b82f6',
          accentHex: branding.visuals?.accentHex || '#f59e0b',
          backgroundHex: branding.visuals?.backgroundHex || '#09090b',
          headingFont: branding.visuals?.headingFont || 'Outfit',
          bodyFont: branding.visuals?.bodyFont || 'Inter',
          numberFont: branding.visuals?.numberFont || 'JetBrains Mono',
          imageStyle: branding.visuals?.imageStyle || 'Minimalist'
        });

        setLayoutRules({
          navbar_style: branding.layout_rules?.navbar_style || 'sticky',
          footer_style: branding.layout_rules?.footer_style || 'standard'
        });

        const voiceTone = branding.voice?.tone || 'Professional';
        const voiceWords = branding.voice?.prohibited_words || [];
        const voiceSlang = branding.voice?.slang_allowed || false;

        setVoice({
          tone: voiceTone,
          prohibited_words: voiceWords,
          slang_allowed: voiceSlang
        });

        setRawProhibitedWords(voiceWords.join(', '));
      } catch (err) {
        console.error('Error loading briefing:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setSaving(true);
    try {
      const currentCtx = project.contextoJson || {};
      
      const wordsArr = rawProhibitedWords
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0);

      const updatedBranding = {
        identity,
        visuals,
        layout_rules: layoutRules,
        voice: {
          ...voice,
          prohibited_words: wordsArr
        },
        restrictions: currentCtx.branding?.restrictions || { no_go_list: [] }
      };

      const updatedCtx = {
        ...currentCtx,
        branding: updatedBranding
      };

      // If sitemap exists, let's sync project name
      if (updatedCtx.sitemap) {
        updatedCtx.sitemap.project_name = identity.name;
      }

      await api.put(`/Project/${projectId}/feasibility`, updatedCtx);
      
      setProject({
        ...project,
        contextoJson: updatedCtx
      });

      Swal.fire({
        title: '¡Briefing Guardado!',
        text: 'La identidad de la marca se ha guardado correctamente y sincronizado con el Sitemap.',
        icon: 'success',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#10b981'
      });
    } catch (err) {
      console.error('Error saving briefing:', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar la configuración de relevamiento.',
        icon: 'error',
        background: '#18181b',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Identidad de Marca */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Info size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Identidad de Marca</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Propósito y personalidad del sitio</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Nombre Comercial del Proyecto</label>
              <input
                type="text"
                value={identity.name}
                onChange={e => setIdentity({ ...identity, name: e.target.value })}
                placeholder="Nombre del sitio o negocio"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Propósito / Objetivos del Sitio</label>
              <textarea
                value={identity.purpose}
                onChange={e => setIdentity({ ...identity, purpose: e.target.value })}
                placeholder="Ej: Captar leads para venta de servicios, vender productos físicos, etc."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Eslogan</label>
                <input
                  type="text"
                  value={identity.slogan}
                  onChange={e => setIdentity({ ...identity, slogan: e.target.value })}
                  placeholder="Frase comercial"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Personalidad / Estética</label>
                <input
                  type="text"
                  value={identity.personality}
                  onChange={e => setIdentity({ ...identity, personality: e.target.value })}
                  placeholder="Ej: Tecnológica, Minimalista, Premium, Divertida"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branding Visual */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Paleta & Visuales</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Esquema de colores y tipografías</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Color Principal</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={visuals.primaryHex}
                  onChange={e => setVisuals({ ...visuals, primaryHex: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-zinc-800 bg-transparent"
                />
                <input
                  type="text"
                  value={visuals.primaryHex}
                  onChange={e => setVisuals({ ...visuals, primaryHex: e.target.value })}
                  className="w-16 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-white focus:outline-none text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Secundario</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={visuals.secondaryHex}
                  onChange={e => setVisuals({ ...visuals, secondaryHex: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-zinc-800 bg-transparent"
                />
                <input
                  type="text"
                  value={visuals.secondaryHex}
                  onChange={e => setVisuals({ ...visuals, secondaryHex: e.target.value })}
                  className="w-16 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-white focus:outline-none text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Acento</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={visuals.accentHex}
                  onChange={e => setVisuals({ ...visuals, accentHex: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-zinc-800 bg-transparent"
                />
                <input
                  type="text"
                  value={visuals.accentHex}
                  onChange={e => setVisuals({ ...visuals, accentHex: e.target.value })}
                  className="w-16 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-white focus:outline-none text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Fondo</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={visuals.backgroundHex}
                  onChange={e => setVisuals({ ...visuals, backgroundHex: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-zinc-800 bg-transparent"
                />
                <input
                  type="text"
                  value={visuals.backgroundHex}
                  onChange={e => setVisuals({ ...visuals, backgroundHex: e.target.value })}
                  className="w-16 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-[11px] text-white focus:outline-none text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Tipografía Títulos</label>
              <select
                value={visuals.headingFont}
                onChange={e => setVisuals({ ...visuals, headingFont: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              >
                <option value="Outfit">Outfit</option>
                <option value="Inter">Inter</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Tipografía Cuerpo</label>
              <select
                value={visuals.bodyFont}
                onChange={e => setVisuals({ ...visuals, bodyFont: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Outfit">Outfit</option>
                <option value="Merriweather">Merriweather</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Estilo de Imágenes Sugerido</label>
            <select
              value={visuals.imageStyle}
              onChange={e => setVisuals({ ...visuals, imageStyle: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
            >
              <option value="Minimalist">Mínimo / Vectorial</option>
              <option value="High Quality Photos">Fotografía Realista HD</option>
              <option value="3D Render">Renders e Ilustraciones 3D</option>
              <option value="Abstract Gradient">Abstracto & Gradientes</option>
            </select>
          </div>
        </div>

        {/* Reglas de Layout */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Layout size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Reglas de Estructura</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Layouts y comportamiento del sitio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Menú de Navegación (Navbar)</label>
              <select
                value={layoutRules.navbar_style}
                onChange={e => setLayoutRules({ ...layoutRules, navbar_style: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              >
                <option value="sticky">Sticky (Fijo al hacer scroll)</option>
                <option value="transparent">Transparent Overlay (Flotante traslúcido)</option>
                <option value="standard">Standard (Arriba estático)</option>
                <option value="hidden">Oculto / Menu lateral (Burger)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Pie de Página (Footer)</label>
              <select
                value={layoutRules.footer_style}
                onChange={e => setLayoutRules({ ...layoutRules, footer_style: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              >
                <option value="standard">Completo (Links, Redes, Formulario)</option>
                <option value="simple">Simple (Copyright + Redes)</option>
                <option value="minimal">Mínimo (Solo texto legal)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tonalidad y Exclusiones */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Comunicación & Voz</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Restricciones de copy y tono</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Tono de Voz Comercial</label>
              <select
                value={voice.tone}
                onChange={e => setVoice({ ...voice, tone: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              >
                <option value="Professional">Profesional & Serio</option>
                <option value="Casual">Casual & Amigable</option>
                <option value="Expert">Experto & Técnico</option>
                <option value="Bold">Atrevido & Directo</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Palabras Prohibidas (Exclusiones)</label>
              <input
                type="text"
                value={rawProhibitedWords}
                onChange={e => setRawProhibitedWords(e.target.value)}
                placeholder="barato, facil, garantizado (separadas por coma)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
              <span className="text-[9px] text-zinc-600 block mt-1 font-bold">Estas palabras se marcarán como errores si se intentan usar en copys sugeridos por IA.</span>
            </div>

            <div className="flex items-center gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 mt-2">
              <input
                type="checkbox"
                id="slang_allowed"
                checked={voice.slang_allowed}
                onChange={e => setVoice({ ...voice, slang_allowed: e.target.checked })}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer bg-transparent border-zinc-800"
              />
              <label htmlFor="slang_allowed" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer select-none">
                Permitir modismos o jergas locales (Slang)
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* Botón de Guardado flotante/fijo al final */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-3 px-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Guardando Identidad...
            </>
          ) : (
            <>
              <Save size={16} />
              Guardar Briefing
            </>
          )}
        </button>
      </div>
    </form>
  );
};
