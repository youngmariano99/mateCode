/**
 * Normaliza un nombre de etiqueta a snake_case ASCII seguro.
 */
export function normalizarNombreEtiqueta(crudo: string): string {
  return crudo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

/**
 * Bloque XML semántico — usado para vistas previas/badges.
 */
export interface BloqueXml {
  readonly etiqueta: string;
  readonly contenido: string;
}

/** Resultado de envolver una selección dentro de etiquetas XML. */
export interface ResultadoInsercionXml {
  readonly contenido: string;
  readonly inicioCursor: number;
  readonly finCursor: number;
}

/**
 * Inserta o envuelve una etiqueta XML en una cadena base, devolviendo
 * la nueva cadena y la posición esperada del cursor.
 *
 * - Si `inicio === fin` (sin selección), inserta `<etiqueta>|</etiqueta>`
 *   con el cursor en `|`.
 * - Si hay selección, la envuelve preservando su contenido.
 */
export function insertarEtiquetaEnTexto(
  texto: string,
  etiqueta: string,
  inicio: number,
  fin: number,
): ResultadoInsercionXml {
  const apertura = `<${etiqueta}>`;
  const cierre = `</${etiqueta}>`;
  const seleccion = texto.slice(inicio, fin);
  const tieneSeleccion = seleccion.length > 0;

  const cuerpo = tieneSeleccion ? seleccion : "\n\n";
  const contenido = texto.slice(0, inicio) + apertura + cuerpo + cierre + texto.slice(fin);

  const inicioCursor = inicio + apertura.length;
  const finCursor = tieneSeleccion ? inicioCursor + seleccion.length : inicioCursor + 1;

  return { contenido, inicioCursor, finCursor };
}

/**
 * Parser superficial: extrae bloques XML top-level `<tag>...</tag>`.
 * No soporta anidamiento — suficiente para previews y conteo de bloques.
 * Si no encuentra ninguno, devuelve un único bloque "documento" con el
 * texto crudo (preserva el contenido para no perder información).
 */
export function parsearXmlEnBloques(xml: string): ReadonlyArray<BloqueXml> {
  const regex = /<([a-zA-Z_][a-zA-Z0-9_-]*)>([\s\S]*?)<\/\1>/g;
  const bloques: BloqueXml[] = [];
  let coincidencia: RegExpExecArray | null;
  while ((coincidencia = regex.exec(xml)) !== null) {
    bloques.push({ etiqueta: coincidencia[1], contenido: coincidencia[2].trim() });
  }
  if (bloques.length === 0 && xml.trim().length > 0) {
    return [{ etiqueta: "documento", contenido: xml.trim() }];
  }
  return bloques;
}

/** Renderiza bloques semánticos como XML legible (indentación 2 espacios). */
export function renderizarBloquesComoXml(bloques: ReadonlyArray<BloqueXml>): string {
  return bloques
    .map((b) => `<${b.etiqueta}>\n  ${b.contenido.replace(/\n/g, "\n  ")}\n</${b.etiqueta}>`)
    .join("\n\n");
}

/** Vacía el contenido de las etiquetas, dejando solo la estructura. */
export function vaciarContenidoXml(xml: string): string {
  return xml.replace(/<([a-zA-Z_][a-zA-Z0-9_-]*)>[\s\S]*?<\/\1>/g, "<$1>\n  \n</$1>");
}
