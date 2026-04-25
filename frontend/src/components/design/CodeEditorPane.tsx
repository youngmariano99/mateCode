
interface CodeEditorPaneProps {
    code: string;
    onChange: (code: string) => void;
}

export const CodeEditorPane = ({ code, onChange }: CodeEditorPaneProps) => {
    return (
        <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-zinc-900 text-zinc-300 p-5 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-emerald-500/30 selection:text-emerald-200 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            placeholder="Pega tu JSON aquí..."
        />
    );
};
