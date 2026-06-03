import { type ChangeEvent } from "react";

interface PropsPanelVariables {
  readonly variables: ReadonlyArray<string>;
  readonly valores: Readonly<Record<string, string>>;
  readonly alCambiar: (nombre: string, valor: string) => void;
}

/**
 * Panel lateral del Motor de Variables Dinámicas.
 * Renderiza un input por cada `{{VARIABLE}}` única detectada en la
 * Pizarra. Los valores se reflejan en tiempo real en la vista previa
 * (el contenido crudo no se muta; la sustitución ocurre al compilar).
 */
export function PanelVariables({ variables, valores, alCambiar }: PropsPanelVariables) {
  if (variables.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Sin variables</p>
        <p className="mt-1">
          Escribí <code className="text-foreground">{`{{NOMBRE}}`}</code> en la
          pizarra para generar inputs automáticos acá.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>Variables dinámicas</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">
          {variables.length}
        </span>
      </div>
      <div className="space-y-2.5">
        {variables.map((nombre) => (
          <label key={nombre} className="block">
            <span className="mb-1 block font-mono text-[11px] text-primary">
              {`{{${nombre}}}`}
            </span>
            <input
              type="text"
              value={valores[nombre] ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => alCambiar(nombre, e.target.value)}
              placeholder={`Valor para ${nombre}`}
              className="h-8 w-full rounded-md border border-border bg-input px-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
