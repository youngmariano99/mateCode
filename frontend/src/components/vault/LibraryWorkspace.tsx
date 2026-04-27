import React, { useState } from 'react';
import { PromptLibrary } from '../../pages/vault/PromptLibrary';
import { FormLibrary } from '../../pages/vault/FormLibrary';
import { StandardLibrary } from '../../pages/vault/StandardLibrary';
import { BookOpen, Sparkles, FileText, ShieldCheck, LayoutGrid, X } from 'lucide-react';

type LibraryTab = 'prompts' | 'forms' | 'standards';

export const LibraryWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('prompts');

  const tabs = [
    { id: 'prompts', label: 'Oráculo (Prompts)', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'forms', label: 'Formularios', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'standards', label: 'Estándares', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'prompts': return <PromptLibrary />;
      case 'forms': return <FormLibrary />;
      case 'standards': return <StandardLibrary />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* Header Estilo Biblioteca */}
      <div className="flex items-center justify-between p-8 bg-white/5 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
            <BookOpen className="text-emerald-500" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Biblioteca <span className="text-emerald-500">IA Vault</span></h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500" /> Repositorio Central de Inteligencia Colectiva
            </p>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as LibraryTab)}
               className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab.id 
                 ? `${tab.bg} ${tab.color} shadow-lg shadow-black/20` 
                 : 'text-zinc-500 hover:text-white hover:bg-white/5'
               }`}
             >
               <tab.icon size={14} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-zinc-950/20">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
      </div>
    </div>
  );
};
