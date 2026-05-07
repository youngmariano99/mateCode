/**
 * ============================================================================
 *  <FloatingScratchpad /> — PiP Note Taker
 * ============================================================================
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, StickyNote } from "lucide-react";

const STORAGE_KEY = "matecode_scratchpad_v1";

export const FloatingScratchpad = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [text, setText] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setText(saved);
    } catch {
      /* storage blocked */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-[300] w-72 rounded-2xl border border-white/10 bg-[#0A0F1A]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ease-in-out ${
        collapsed ? "h-12" : "h-80"
      }`}
    >
      <div 
        className="h-12 flex items-center justify-between px-4 bg-zinc-900/40 border-b border-white/5 select-none cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <StickyNote className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Scratchpad
          </span>
        </div>
        <button
          className="h-7 w-7 grid place-items-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {!collapsed && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="// Apuntes rápidos, IDs, variables..."
          spellCheck={false}
          className="w-full h-[calc(100%-3rem)] resize-none bg-transparent text-zinc-300 font-mono text-[11px] p-5 outline-none border-0 placeholder:text-zinc-700 leading-relaxed scrollbar-hide"
        />
      )}
    </div>
  );
};

export default FloatingScratchpad;
