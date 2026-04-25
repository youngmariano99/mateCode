import React, { useState, useEffect } from 'react';
import { Layout, Palette, Download } from 'lucide-react';
import { SitemapBoard } from './SitemapBoard';
import { BrandingStudio } from './BrandingStudio';
import type { SitemapBrandingState } from '../../services/design/SitemapBrandingTypes';

interface Props {
    initialCode: string;
    onCodeChange: (code: string) => void;
}

const DEFAULT_STATE: SitemapBrandingState = {
    sitemap: {
        project_name: 'Proyecto MateCode',
        pages: [
            { id: 'p1', name: 'Inicio', route: '/', sections: [{ id: 's1', title: 'Hero', description: 'Presentación del producto' }] }
        ]
    },
    branding: {
        identity: { name: '', purpose: '', slogan: '', personality: '' },
        visuals: { 
            primaryHex: '#10b981', 
            secondaryHex: '#3b82f6', 
            accentHex: '#f59e0b', 
            backgroundHex: '#09090b',
            headingFont: 'Inter',
            bodyFont: 'Inter',
            numberFont: 'JetBrains Mono',
            imageStyle: 'Minimalist'
        },
        layout_rules: { navbar_style: 'sticky', footer_style: 'standard' },
        voice: { tone: 'Professional', prohibited_words: [], slang_allowed: false },
        restrictions: { no_go_list: [] }
    }
};

export const UniversalSitemapBrandingWorkspace: React.FC<Props> = ({ initialCode, onCodeChange }) => {
    const [view, setView] = useState<'sitemap' | 'branding'>('sitemap');
    const [state, setState] = useState<SitemapBrandingState>(() => {
        try {
            const parsed = JSON.parse(initialCode);
            // Asegurar que tenga las propiedades básicas o usar fallback
            return {
                sitemap: parsed.sitemap || DEFAULT_STATE.sitemap,
                branding: parsed.branding || DEFAULT_STATE.branding
            };
        } catch {
            return DEFAULT_STATE;
        }
    });

    useEffect(() => {
        onCodeChange(JSON.stringify(state, null, 2));
    }, [state]);

    // Sincronizar desde el Editor hacia el Estado Visual
    useEffect(() => {
        try {
            const parsed = JSON.parse(initialCode);
            const currentStringified = JSON.stringify(state);
            const incomingStringified = JSON.stringify(parsed);
            
            // Solo actualizar si el contenido estructural es diferente
            if (currentStringified !== incomingStringified) {
                setState({
                    sitemap: parsed.sitemap || DEFAULT_STATE.sitemap,
                    branding: parsed.branding || DEFAULT_STATE.branding
                });
            }
        } catch (e) {
            // Ignorar errores de parsing mientras el usuario escribe JSON incompleto
        }
    }, [initialCode]);

    const exportToMarkdown = () => {
        let md = `# 🏗️ ESPECIFICACIÓN TÉCNICA DE DISEÑO: ${state.sitemap.project_name.toUpperCase()}\n\n`;
        
        md += `> [!IMPORTANT]\n`;
        md += `> **CONTESTO PARA IA**: Este documento contiene la arquitectura de información y el sistema de branding de un proyecto de software. Utiliza estas especificaciones para cualquier generación de código, UI o contenido relacionado.\n\n`;

        md += `## 1. 🎯 IDENTIDAD Y PROPÓSITO\n`;
        md += `| Atributo | Valor |\n`;
        md += `| :--- | :--- |\n`;
        md += `| **Nombre del Proyecto** | ${state.sitemap.project_name} |\n`;
        md += `| **Slogan** | ${state.branding.identity.slogan || 'No definido'} |\n`;
        md += `| **Propósito** | ${state.branding.identity.purpose || 'No definido'} |\n`;
        md += `| **Personalidad de Marca** | ${state.branding.identity.personality || 'No definida'} |\n\n`;

        md += `## 🎨 2. SISTEMA VISUAL (UI KIT)\n`;
        md += `### 2.1 Paleta de Colores\n`;
        md += `| Rol | Código HEX | Aplicación |\n`;
        md += `| :--- | :--- | :--- |\n`;
        md += `| **Primario** | \`${state.branding.visuals.primaryHex}\` | Botones principales, headers, acentos de marca |\n`;
        md += `| **Secundario** | \`${state.branding.visuals.secondaryHex}\` | Elementos de apoyo, hover states |\n`;
        md += `| **Acento** | \`${state.branding.visuals.accentHex}\` | Notificaciones, estados activos, detalles visuales |\n`;
        md += `| **Fondo** | \`${state.branding.visuals.backgroundHex}\` | Superficies de contenedores y background general |\n\n`;

        md += `### 2.2 Tipografías y Estilos\n`;
        md += `- **Fuentes de Títulos**: \`${state.branding.visuals.headingFont}\` (Jerarquía H1-H6)\n`;
        md += `- **Fuente de Cuerpo**: \`${state.branding.visuals.bodyFont}\` (Párrafos, inputs, etiquetas)\n`;
        md += `- **Fuente de Datos/Números**: \`${state.branding.visuals.numberFont}\` (Tablas, métricas, código)\n`;
        md += `- **Estilo de Imágenes**: \`${state.branding.visuals.imageStyle}\` (Guía para generación de assets)\n\n`;

        md += `## 🗣️ 3. VOZ, TONO Y REGLAS\n`;
        md += `### 3.1 Guía de Comunicación\n`;
        md += `- **Tono de Voz**: ${state.branding.voice.tone}\n`;
        md += `- **Permitir Slang**: ${state.branding.voice.slang_allowed ? '✅ SÍ (Uso de modismos e informalidad permitida)' : '❌ NO (Mantener lenguaje técnico/formal)'}\n`;
        md += `- **Palabras Prohibidas**: ${state.branding.voice.prohibited_words.length > 0 ? state.branding.voice.prohibited_words.join(', ') : 'Ninguna'}\n\n`;

        md += `### 3.2 Restricciones de Diseño (No-Go List)\n`;
        if (state.branding.restrictions.no_go_list.length > 0) {
            state.branding.restrictions.no_go_list.forEach(rule => {
                md += `- 🚫 ${rule}\n`;
            });
        } else {
            md += `*No hay restricciones específicas definidas.*\n`;
        }
        md += `\n`;

        md += `## 🗺️ 4. ARQUITECTURA DE INFORMACIÓN (SITEMAP)\n`;
        state.sitemap.pages.forEach((page, index) => {
            md += `### ${index + 1}. Página: ${page.name}\n`;
            md += `- **Ruta/Route**: \`${page.route}\`\n`;
            md += `- **Secciones Clave**:\n`;
            page.sections.forEach(sec => {
                md += `  - **${sec.title}**: ${sec.description}\n`;
            });
            md += `\n`;
        });

        md += `---\n`;
        md += `*Documento generado automáticamente por MateCode Oráculo de Diseño - ${new Date().toLocaleDateString()}*`;

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Design_Spec_${state.sitemap.project_name.replace(/\s+/g, '_')}.md`;
        a.click();
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Sub-Header Tabs */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button 
                        onClick={() => setView('sitemap')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === 'sitemap' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <Layout size={14} /> Sitemap (Wiremap)
                    </button>
                    <button 
                        onClick={() => setView('branding')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === 'branding' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <Palette size={14} /> Branding Studio
                    </button>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={exportToMarkdown}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700 flex items-center gap-2 shadow-lg"
                    >
                        <Download size={14} /> Exportar MD
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden p-6">
                {view === 'sitemap' ? (
                    <SitemapBoard 
                        sitemap={state.sitemap} 
                        onChange={(s) => setState(prev => ({ ...prev, sitemap: s }))} 
                    />
                ) : (
                    <BrandingStudio 
                        branding={state.branding} 
                        onChange={(b) => setState(prev => ({ ...prev, branding: b }))} 
                    />
                )}
            </div>
        </div>
    );
};
