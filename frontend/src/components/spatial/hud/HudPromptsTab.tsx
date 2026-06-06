import React from "react";
import { Copy } from "lucide-react";

export const DEFAULT_PROMPTS = [
  {
    title: "🗄️ Esquema DB (ERD)",
    description: "Diseñar tablas y relaciones SQL en formato JSON compatible.",
    prompt: `Actúa como Arquitecto de Base de Datos Senior. Diseña el esquema de tablas para un sistema con las siguientes características: [DESCRIBE EL CASO]. Devuelve únicamente el JSON válido en el formato requerido por MateCode:
{
  "project_name": "Nombre",
  "default_engine": "postgresql",
  "tables": [
    {
      "id": "t1",
      "name": "usuarios",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true },
        { "name": "email", "data_family": "string" }
      ]
    }
  ],
  "relationships": []
}`
  },
  {
    title: "📋 Historias de Usuario BDD",
    description: "Escribir historias detalladas en formato Gherkin (Dado/Cuando/Entonces).",
    prompt: "Actúa como Product Owner Senior. Escribe 5 Historias de Usuario estructuradas en formato Gherkin (Dado que, Cuando, Entonces) para la funcionalidad de: [DESCRIBE LA FUNCIONALIDAD]."
  },
  {
    title: "🎨 Identidad Visual y UI",
    description: "Definir paleta de colores, tipografías y reglas estéticas.",
    prompt: "Genera una paleta de colores y reglas de diseño estéticas basadas en los siguientes pilares de identidad: [PILARES]. Retorna la paleta en formato HEX (Primario, Secundario, Acento, Fondo) y las tipografías idóneas de Google Fonts."
  },
  {
    title: "🇦🇷 Mentor Técnico Argentino",
    description: "Asistente con modismos argentinos y rigor técnico.",
    prompt: "Actúa como un programador senior argentino, muy buena onda, experimentado, que me ayuda a depurar y guiar mi código paso a paso usando modismos locales como 'che', 'viste', 'de una', pero manteniendo el rigor técnico absoluto."
  }
];

interface HudPromptsTabProps {
  onCopyToClipboard: (text: string, label: string) => void;
}

export const HudPromptsTab: React.FC<HudPromptsTabProps> = ({ onCopyToClipboard }) => {
  return (
    <div className="space-y-3">
      {DEFAULT_PROMPTS.map((item, idx) => (
        <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2">
          <div>
            <h4 className="text-[11px] font-black text-white uppercase">{item.title}</h4>
            <p className="text-[9px] text-zinc-500 mt-0.5 leading-snug">{item.description}</p>
          </div>
          <button 
            onClick={() => onCopyToClipboard(item.prompt, item.title)}
            className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
          >
            <Copy size={10} /> Copiar Prompt
          </button>
        </div>
      ))}
    </div>
  );
};
