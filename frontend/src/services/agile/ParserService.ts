export interface DiagramNode {
    id: string;
    type: string;
    data: { label: string; [key: string]: any };
    position: { x: number; y: number };
}

export interface DiagramEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

export class ParserService {
    /**
     * Transforma un DBML simplificado en nodos y aristas para React Flow.
     * Ejemplo soportado: 
     * Table users {
     *   id int [pk]
     *   email varchar
     * }
     */
    static parseDBML(dbml: string): { nodes: DiagramNode[], edges: DiagramEdge[] } {
        const nodes: DiagramNode[] = [];
        const edges: DiagramEdge[] = [];
        
        const tableRegex = /Table\s+(\w+)\s*{([^}]+)}/g;
        let match;
        let xOffset = 0;

        while ((match = tableRegex.exec(dbml)) !== null) {
            const tableName = match[1];
            const content = match[2];
            
            // Extraer columnas
            const columns = content.trim().split('\n').map(line => line.trim());
            
            nodes.push({
                id: tableName,
                type: 'default',
                data: { 
                    label: tableName,
                    columns: columns 
                },
                position: { x: xOffset, y: 100 }
            });

            // Extraer relaciones simples (ref: > users.id)
            const refRegex = /(\w+)\s+\w+\s+\[ref:\s+>\s+(\w+)\.(\w+)\]/g;
            let refMatch;
            while ((refMatch = refRegex.exec(content)) !== null) {
                edges.push({
                    id: `e-${tableName}-${refMatch[2]}`,
                    source: tableName,
                    target: refMatch[2],
                    label: 'ref'
                });
            }

            xOffset += 300;
        }

        return { nodes, edges };
    }
}
