
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
            className="flex-1 w-full bg-zinc-900 text-zinc-300 p-5 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-emerald-500/30 selection:text-emerald-200"
            placeholder="Escribí tu DBML aquí..."
        />
    );
};
