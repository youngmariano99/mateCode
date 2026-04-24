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

    const exportToMarkdown = () => {
        let md = `# Design Specification: ${state.sitemap.project_name}\n\n`;
        
        md += `## 1. Information Architecture (Sitemap)\n`;
        state.sitemap.pages.forEach(page => {
            md += `### Page: ${page.name} (${page.route})\n`;
            page.sections.forEach(sec => {
                md += `- **${sec.title}**: ${sec.description}\n`;
            });
            md += `\n`;
        });

        md += `## 2. Branding & Identity\n`;
        md += `### 2.1 Identity\n`;
        md += `- **Purpose**: ${state.branding.identity.purpose}\n`;
        md += `- **Slogan**: ${state.branding.identity.slogan}\n`;
        md += `- **Personality**: ${state.branding.identity.personality}\n\n`;

        md += `### 2.2 Visual System\n`;
        md += `- **Primary Color**: ${state.branding.visuals.primaryHex}\n`;
        md += `- **Secondary Color**: ${state.branding.visuals.secondaryHex}\n`;
        md += `- **Background**: ${state.branding.visuals.backgroundHex}\n`;
        md += `- **Fonts**: ${state.branding.visuals.headingFont} / ${state.branding.visuals.bodyFont}\n\n`;

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Design_Spec_${state.sitemap.project_name}.md`;
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
