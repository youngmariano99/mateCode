import { parsearXmlEnBloques } from "./constructorXml";
import type { BloqueXml } from "./constructorXml";

export type MotorRenderizado = "XML" | "Markdown" | "JSON";

export interface OpcionesCompilacion {
  readonly motor: MotorRenderizado;
}

/** Compila un texto XML-like al motor seleccionado. */
export function compilarConMotor(textoXml: string, opciones: OpcionesCompilacion): string {
  switch (opciones.motor) {
    case "XML":
      return textoXml.trim();
    case "Markdown":
      return renderizarComoMarkdown(textoXml);
    case "JSON":
      return renderizarComoJson(textoXml);
  }
}

/** Renderiza bloques top-level como secciones Markdown `### tag`. */
export function renderizarComoMarkdown(textoXml: string): string {
  const bloques = parsearXmlEnBloques(textoXml);
  if (bloques.length === 0) return textoXml.trim();
  return bloques.map((b) => formatearSeccionMarkdown(b)).join("\n\n").trim();
}

function formatearSeccionMarkdown(bloque: BloqueXml): string {
  const titulo = humanizarEtiqueta(bloque.etiqueta);
  return `### ${titulo}\n\n${bloque.contenido.trim()}`;
}

/** Renderiza bloques top-level como un objeto JSON indentado. */
export function renderizarComoJson(textoXml: string): string {
  const bloques = parsearXmlEnBloques(textoXml);
  if (bloques.length === 0) {
    return JSON.stringify({ contenido: textoXml.trim() }, null, 2);
  }
  const objeto: Record<string, string> = {};
  for (const b of bloques) {
    objeto[b.etiqueta] = b.contenido.trim();
  }
  return JSON.stringify(objeto, null, 2);
}

/** "imperativo_de_tarea" → "Imperativo De Tarea" */
function humanizarEtiqueta(etiqueta: string): string {
  return etiqueta
    .split(/[_\-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
