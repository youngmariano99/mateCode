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

    /**
     * Parsea PlantUML simplificado para Casos de Uso.
     */
    static parsePlantUML(puml: string): { nodes: DiagramNode[], edges: DiagramEdge[] } {
        const nodes: DiagramNode[] = [];
        const edges: DiagramEdge[] = [];
        
        // Match actores y casos de uso
        const actorRegex = /actor\s+"([^"]+)"\s+as\s+(\w+)/g;
        const usecaseRegex = /usecase\s+"([^"]+)"\s+as\s+(\w+)/g;
        const relationRegex = /(\w+)\s+-->\s+(\w+)/g;

        let match;
        let y = 50;
        while ((match = actorRegex.exec(puml)) !== null) {
            nodes.push({ id: match[2], type: 'input', data: { label: `👤 ${match[1]}` }, position: { x: 50, y } });
            y += 100;
        }

        y = 50;
        while ((match = usecaseRegex.exec(puml)) !== null) {
            nodes.push({ id: match[2], type: 'output', data: { label: `⚙️ ${match[1]}` }, position: { x: 300, y } });
            y += 100;
        }

        while ((match = relationRegex.exec(puml)) !== null) {
            edges.push({ id: `e-${match[1]}-${match[2]}`, source: match[1], target: match[2] });
        }

        return { nodes, edges };
    }

    /**
     * Parsea un Sitemap en JSON.
     */
    static parseSitemap(jsonStr: string): { nodes: DiagramNode[], edges: DiagramEdge[] } {
        try {
            const data = JSON.parse(jsonStr);
            const nodes: DiagramNode[] = [];
            const edges: DiagramEdge[] = [];
            
            if (data.sitemap) {
                let x = 0;
                Object.keys(data.sitemap).forEach(key => {
                    nodes.push({ id: key, type: 'default', data: { label: `📄 ${key.toUpperCase()}` }, position: { x, y: 0 } });
                    
                    const sections = data.sitemap[key].sections || [];
                    sections.forEach((sec: any, idx: number) => {
                        const childId = `${key}-${idx}`;
                        nodes.push({ id: childId, type: 'default', data: { label: `🔸 ${sec.name}` }, position: { x, y: (idx + 1) * 100 } });
                        edges.push({ id: `e-${key}-${childId}`, source: key, target: childId });
                    });
                    x += 250;
                });
            }
            return { nodes, edges };
        } catch {
            return { nodes: [], edges: [] };
        }
    }
}
