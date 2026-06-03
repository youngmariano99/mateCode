const REGEX_VARIABLE = /\{\{\s*([A-Za-z0-9_\-]+)\s*\}\}/g;

export function extraerVariables(texto: string): ReadonlyArray<string> {
  const vistos = new Set<string>();
  const orden: string[] = [];
  let m: RegExpExecArray | null;
  REGEX_VARIABLE.lastIndex = 0;
  while ((m = REGEX_VARIABLE.exec(texto)) !== null) {
    const nombre = m[1];
    if (!vistos.has(nombre)) {
      vistos.add(nombre);
      orden.push(nombre);
    }
  }
  return orden;
}

export function sustituirVariables(
  texto: string,
  valores: Readonly<Record<string, string>>,
): string {
  return texto.replace(REGEX_VARIABLE, (original, nombre: string) => {
    const valor = valores[nombre];
    return valor && valor.length > 0 ? valor : original;
  });
}
