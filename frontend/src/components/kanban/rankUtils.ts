/**
 * Utilidad para calcular el rango lexicográfico medio entre dos strings.
 * Basado en el set de caracteres imprimibles para máxima densidad.
 */
export const getMidRank = (prev: string | null, next: string | null): string => {
    const p = prev || 'a';
    const n = next || 'z'.repeat(p.length + 1);

    let i = 0;
    let res = '';

    while (true) {
        const charP = p.charCodeAt(i) || 0;
        const charN = n.charCodeAt(i) || 122; // 'z'

        if (charP === charN) {
            res += String.fromCharCode(charP);
            i++;
            continue;
        }

        const mid = Math.floor((charP + charN) / 2);
        if (mid > charP) {
            res += String.fromCharCode(mid);
            break;
        } else {
            res += String.fromCharCode(charP);
            i++;
        }
    }

    return res;
};
