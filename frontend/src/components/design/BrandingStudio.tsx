import React, { useState } from 'react';
import { Palette, Type, MessageSquare, ShieldAlert } from 'lucide-react';
import type { BrandingProfile } from '../../services/design/SitemapBrandingTypes';

interface Props {
    branding: BrandingProfile;
    onChange: (newBranding: BrandingProfile) => void;
}

export const BrandingStudio: React.FC<Props> = ({ branding, onChange }) => {
    const [activeTab, setActiveTab] = useState<'identity' | 'visuals' | 'voice' | 'rules'>('identity');
    const [manualFonts, setManualFonts] = useState({ heading: false, body: false, number: false });

    const updateIdentity = (field: keyof BrandingProfile['identity'], value: string) => {
        onChange({ ...branding, identity: { ...branding.identity, [field]: value } });
    };

    const updateVisuals = (field: keyof BrandingProfile['visuals'], value: string) => {
        onChange({ ...branding, visuals: { ...branding.visuals, [field]: value } });
    };

    const updateVoice = (field: keyof BrandingProfile['voice'], value: any) => {
        onChange({ ...branding, voice: { ...branding.voice, [field]: value } });
    };

    const updateRestrictions = (noGoList: string[]) => {
        onChange({ ...branding, restrictions: { ...branding.restrictions, no_go_list: noGoList } });
    };

    const applyPreset = (preset: any) => {
        onChange({
            ...branding,
            visuals: {
                ...branding.visuals,
                primaryHex: preset.primary,
                secondaryHex: preset.secondary,
                accentHex: preset.accent,
                backgroundHex: preset.bg
            }
        });
    };

    const colorPresets = [
        { name: 'Cyberpunk', primary: '#f0db4f', secondary: '#ff003c', accent: '#00ff9f', bg: '#0b0e11' },
        { name: 'Elegant', primary: '#c5a358', secondary: '#1a1a1a', accent: '#ffffff', bg: '#050505' },
        { name: 'Nature', primary: '#10b981', secondary: '#064e3b', accent: '#fbbf24', bg: '#f9fafb' },
        { name: 'Corporate', primary: '#2563eb', secondary: '#1e293b', accent: '#64748b', bg: '#ffffff' },
    ];

    const popularFonts = [
        'Inter', 'Roboto', 'Montserrat', 'Space Grotesk', 'Outfit', 'Lexend', 
        'Playfair Display', 'Source Code Pro', 'Plus Jakarta Sans', 'Cabinet Grotesk',
        'JetBrains Mono', 'Fira Code'
    ];

    return (
        <div className="flex h-full bg-zinc-950/50 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Palette className="text-emerald-500" size={16} /> Branding Studio
                    </h3>
                </div>
                <div className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'identity', label: 'Identidad', icon: MessageSquare },
                        { id: 'visuals', label: 'Visuales', icon: Palette },
                        { id: 'voice', label: 'Voz y Tono', icon: Type },
                        { id: 'rules', label: 'Restricciones', icon: ShieldAlert },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full p-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                                activeTab === tab.id 
                                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20' 
                                : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-zinc-950/20 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {activeTab === 'identity' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                         <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6">
                            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Núcleo de Marca</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre de Marca</label>
                                    <input 
                                        value={branding.identity.name} 
                                        onChange={e => updateIdentity('name', e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Slogan</label>
                                    <input 
                                        value={branding.identity.slogan} 
                                        onChange={e => updateIdentity('slogan', e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Propósito de Marca</label>
                                <textarea 
                                    rows={4}
                                    value={branding.identity.purpose} 
                                    onChange={e => updateIdentity('purpose', e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Personalidad</label>
                                <input 
                                    value={branding.identity.personality} 
                                    onChange={e => updateIdentity('personality', e.target.value)}
                                    placeholder="Ej: Innovadora, Cercana, Disruptiva..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'visuals' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {/* Palette Presets */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Paletas Sugeridas</label>
                            <div className="grid grid-cols-4 gap-4">
                                {colorPresets.map(preset => (
                                    <button 
                                        key={preset.name}
                                        onClick={() => applyPreset(preset)}
                                        className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl hover:border-emerald-500 transition-all flex flex-col gap-3 group"
                                    >
                                        <div className="flex h-8 w-full rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                            <div style={{ backgroundColor: preset.primary }} className="flex-1" />
                                            <div style={{ backgroundColor: preset.secondary }} className="flex-1" />
                                            <div style={{ backgroundColor: preset.accent }} className="flex-1" />
                                            <div style={{ backgroundColor: preset.bg }} className="flex-1" />
                                        </div>
                                        <span className="text-[9px] font-black text-zinc-400 uppercase group-hover:text-white">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Wheel Harmony Helper */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Armonía Cromática de tu Marca</h4>
                                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">Visualización real de tu paleta elegida</p>
                                </div>
                                <div className="flex gap-3">
                                    <div style={{ backgroundColor: branding.visuals.primaryHex }} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-500" title="Primario" />
                                    <div style={{ backgroundColor: branding.visuals.secondaryHex }} className="w-8 h-8 rounded-full border-2 border-white/10 transition-all duration-500" title="Secundario" />
                                    <div style={{ backgroundColor: branding.visuals.accentHex }} className="w-8 h-8 rounded-full border-2 border-white/10 transition-all duration-500" title="Acento" />
                                    <div style={{ backgroundColor: branding.visuals.backgroundHex }} className="w-8 h-8 rounded-full border-2 border-white/10 transition-all duration-500" title="Fondo" />
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Primario', field: 'primaryHex' },
                                    { label: 'Secundario', field: 'secondaryHex' },
                                    { label: 'Acento', field: 'accentHex' },
                                    { label: 'Fondo', field: 'backgroundHex' },
                                ].map(color => (
                                    <div key={color.field} className="space-y-3">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{color.label}</label>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                                            <div className="relative w-10 h-10 shrink-0">
                                                <input 
                                                    type="color"
                                                    value={branding.visuals[color.field as keyof BrandingProfile['visuals']]}
                                                    onChange={e => updateVisuals(color.field as any, e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div 
                                                    style={{ backgroundColor: branding.visuals[color.field as keyof BrandingProfile['visuals']] }}
                                                    className="w-full h-full rounded-xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input 
                                                    value={branding.visuals[color.field as keyof BrandingProfile['visuals']]}
                                                    onChange={e => updateVisuals(color.field as any, e.target.value)}
                                                    className="w-full bg-transparent text-[11px] text-white font-mono outline-none uppercase font-bold"
                                                />
                                                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">HEX CODE</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'Fuentes Títulos', field: 'headingFont', stateKey: 'heading' },
                                { label: 'Fuentes Cuerpo', field: 'bodyFont', stateKey: 'body' },
                                { label: 'Fuentes Números', field: 'numberFont', stateKey: 'number' },
                            ].map(font => (
                                <div key={font.field} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{font.label}</label>
                                        <button 
                                            onClick={() => setManualFonts(prev => ({ ...prev, [font.stateKey]: !prev[font.stateKey as keyof typeof manualFonts] }))}
                                            className={`text-[8px] font-black px-2 py-1 rounded-md transition-all ${manualFonts[font.stateKey as keyof typeof manualFonts] ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}
                                        >
                                            {manualFonts[font.stateKey as keyof typeof manualFonts] ? 'MANUAL ON' : 'USAR MANUAL'}
                                        </button>
                                    </div>
                                    {manualFonts[font.stateKey as keyof typeof manualFonts] ? (
                                        <input 
                                            value={branding.visuals[font.field as keyof BrandingProfile['visuals']]}
                                            onChange={e => updateVisuals(font.field as any, e.target.value)}
                                            placeholder="Nombre de la fuente..."
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none animate-in fade-in duration-300"
                                        />
                                    ) : (
                                        <select 
                                            value={branding.visuals[font.field as keyof BrandingProfile['visuals']]}
                                            onChange={e => updateVisuals(font.field as any, e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                                        >
                                            {popularFonts.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'voice' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                         <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tono de Voz</label>
                                <textarea 
                                    value={branding.voice.tone} 
                                    onChange={e => updateVoice('tone', e.target.value)}
                                    placeholder="Ej: Profesional pero amigable, directo y minimalista..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Palabras Prohibidas (Separadas por coma)</label>
                                <input 
                                    value={branding.voice.prohibited_words.join(', ')} 
                                    onChange={e => updateVoice('prohibited_words', e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="Ej: barato, difícil, complicado..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">¿Permitir Slang?</label>
                                    <p className="text-[9px] text-zinc-500 italic">Si se activa, la marca usará modismos y un lenguaje más relajado/informal.</p>
                                </div>
                                <button 
                                    onClick={() => updateVoice('slang_allowed', !branding.voice.slang_allowed)}
                                    className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${branding.voice.slang_allowed ? 'bg-emerald-500 shadow-emerald-900/50' : 'bg-zinc-800 shadow-black/50'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${branding.voice.slang_allowed ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                         <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lista de No-Go (Cosas que NUNCA hacer)</label>
                                <textarea 
                                    rows={6}
                                    value={branding.restrictions.no_go_list.join('\n')} 
                                    onChange={e => updateRestrictions(e.target.value.split('\n'))}
                                    placeholder="Ej: No usar gradientes pesados. No usar comic sans. No mencionar a la competencia..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-emerald-500 outline-none transition-all resize-none"
                                />
                                <p className="text-[9px] text-zinc-600 font-bold italic uppercase tracking-tighter">Una regla por línea</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Preview Component (Internal) */}
                <div className="mt-12 border-t border-zinc-800 pt-12">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 block">Live Brand Preview</label>
                     <div 
                        style={{ backgroundColor: branding.visuals.backgroundHex, fontFamily: branding.visuals.bodyFont }}
                        className="rounded-3xl p-12 border border-zinc-800 shadow-2xl relative overflow-hidden transition-all duration-700"
                    >
                         <div className="relative z-10 space-y-6">
                            <h1 
                                style={{ color: branding.visuals.primaryHex, fontFamily: branding.visuals.headingFont }}
                                className="text-5xl font-black tracking-tighter"
                            >
                                {branding.identity.name || 'Tu Gran Proyecto'}
                            </h1>
                            <p className="text-zinc-400 text-xl max-w-lg leading-relaxed">
                                {branding.identity.slogan || 'El slogan de tu marca aparecerá aquí para que veas el tono visual.'}
                            </p>
                            
                            {/* Visualización de la fuente de números */}
                            <div className="flex gap-8 py-4 border-y border-white/5">
                                <div className="space-y-1">
                                    <span style={{ color: branding.visuals.accentHex, fontFamily: branding.visuals.numberFont }} className="text-3xl font-black block">
                                        1.240,50
                                    </span>
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Métrica de Datos</span>
                                </div>
                                <div className="space-y-1">
                                    <span style={{ color: branding.visuals.primaryHex, fontFamily: branding.visuals.numberFont }} className="text-3xl font-black block">
                                        85%
                                    </span>
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Eficiencia</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    style={{ backgroundColor: branding.visuals.primaryHex }}
                                    className="px-8 py-4 rounded-2xl text-zinc-950 font-black uppercase tracking-widest text-xs shadow-xl"
                                >
                                    Botón Primario
                                </button>
                                <button 
                                    style={{ borderColor: branding.visuals.accentHex, color: branding.visuals.accentHex }}
                                    className="px-8 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-xs"
                                >
                                    Botón Acento
                                </button>
                            </div>
                         </div>

                         {/* Decals para dar profundidad a la preview */}
                         <div style={{ backgroundColor: branding.visuals.accentHex }} className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl" />
                         <div style={{ backgroundColor: branding.visuals.secondaryHex }} className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-10 blur-3xl" />
                     </div>
                </div>
            </div>
        </div>
    );
};
