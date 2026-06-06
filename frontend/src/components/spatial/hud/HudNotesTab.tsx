import React from "react";

interface HudNotesTabProps {
  noteText: string;
  setNoteText: (val: string) => void;
}

export const HudNotesTab: React.FC<HudNotesTabProps> = ({ noteText, setNoteText }) => {
  return (
    <div className="h-full flex flex-col">
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="// Apuntes rápidos, IDs de prueba, variables..."
        spellCheck={false}
        className="w-full h-[320px] resize-none bg-black/30 border border-white/5 rounded-2xl p-4 text-zinc-300 font-mono text-[11px] outline-none focus:border-emerald-500/30 leading-relaxed custom-scrollbar"
      />
    </div>
  );
};
