export interface MetadatosMdc {
  readonly description: string;
  readonly globs: ReadonlyArray<string>;
  readonly alwaysApply: boolean;
}

const METADATOS_POR_DEFECTO: MetadatosMdc = {
  description: "Reglas generadas por MatePrompt",
  globs: ["*"],
  alwaysApply: false,
};

export function construirArchivoMdc(
  contenido: string,
  metadatos: MetadatosMdc = METADATOS_POR_DEFECTO,
): string {
  const cabecera = [
    "---",
    `description: ${metadatos.description}`,
    `globs: [${metadatos.globs.map((g) => `"${g}"`).join(", ")}]`,
    `alwaysApply: ${metadatos.alwaysApply}`,
    "---",
    "",
  ].join("\n");
  return cabecera + contenido.trim() + "\n";
}

export function descargarComoMdc(nombreBase: string, contenido: string): void {
  const archivo = construirArchivoMdc(contenido);
  const blob = new Blob([archivo], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugificar(nombreBase) || "mateprompt"}.mdc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugificar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
