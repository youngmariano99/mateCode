export interface DiagramNode {
    id: string;
    type: string;
    data: { label: string; [key: string]: any };
    position: { x: number; y: number };
    parentId?: string;
}

export interface DiagramEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: any;
}

export class ParserService {
    static parseDBML(dbml: string): { nodes: DiagramNode[], edges: DiagramEdge[] } {
        const nodes: DiagramNode[] = [];
        const edges: DiagramEdge[] = [];
        
        // 1. Extraer Tablas
        const tableRegex = /Table\s+(\w+)\s*{([^}]+)}/g;
        let match;
        let xOffset = 0;
        let yOffset = 0;

        while ((match = tableRegex.exec(dbml)) !== null) {
            const tableName = match[1];
            const content = match[2];
            
            // Parsear columnas detalladamente
            const columnLines = content.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const columns = columnLines.map(line => {
                const parts = line.split(/\s+/);
                const name = parts[0];
                const type = parts[1] || 'text';
                const isPk = line.toLowerCase().includes('[pk]');
                const isFk = line.toLowerCase().includes('[ref:');
                
                return { name, type, isPk, isFk };
            });

            nodes.push({
                id: tableName,
                type: 'database', // Usaremos un nodo personalizado
                data: { 
                    label: tableName,
                    columns: columns 
                },
                position: { x: xOffset, y: yOffset }
            });

            // Layout simple en rejilla
            xOffset += 350;
            if (xOffset > 1000) {
                xOffset = 0;
                yOffset += 400;
            }

            // Relaciones en línea (ref: > users.id)
            const inlineRefRegex = /(\w+)\s+\w+\s+\[ref:\s+([<>])\s+(\w+)\.(\w+)\]/g;
            let refMatch;
            while ((refMatch = inlineRefRegex.exec(content)) !== null) {
                edges.push({
                    id: `e-${tableName}-${refMatch[3]}`,
                    source: tableName,
                    target: refMatch[3],
                    label: refMatch[2] === '>' ? 'N:1' : '1:N'
                });
            }
        }

        // 2. Extraer Relaciones Globales (Ref: posts.user_id > users.id)
        const globalRefRegex = /Ref:\s+(\w+)\.(\w+)\s+([<>])\s+(\w+)\.(\w+)/g;
        while ((match = globalRefRegex.exec(dbml)) !== null) {
            const sourceTable = match[1];
            const targetTable = match[4];
            const op = match[3];

            edges.push({
                id: `e-global-${sourceTable}-${targetTable}`,
                source: sourceTable,
                target: targetTable,
                label: op === '>' ? 'N:1' : '1:N'
            });
        }

        return { nodes, edges };
    }

    /**
     * Parsea PlantUML (Casos de Uso y Secuencia básica).
     */
    static parsePlantUML(puml: string): { nodes: DiagramNode[], edges: DiagramEdge[] } {
        const nodes: DiagramNode[] = [];
        const edges: DiagramEdge[] = [];
        const seenNodes = new Set<string>();
        
        // 1. Detectar Bloque de Sistema (Rectangle)
        // Buscamos rectangle "Nombre" { contenido }
        const systemRegex = /rectangle\s+"([^"]+)"\s*{([\s\S]*?)}/g;
        let systemMatch;
        let systemId = 'sys_main';
        let systemContent = '';

        while ((systemMatch = systemRegex.exec(puml)) !== null) {
            const systemName = systemMatch[1];
            systemContent = systemMatch[2]; // Usaremos esta variable global para la detección simple
            const id = `sys_${systemName.replace(/\s+/g, '_')}`;
            systemId = id; // Actualizar el ID global para los hijos

            nodes.push({
                id,
                type: 'system',
                data: { label: systemName },
                position: { x: 300, y: 50 } 
            });
            seenNodes.add(id);
        }

        // 2. Extraer Actores y Participantes (General)
        const actorRegex = /(actor|participant|usecase)\s+("([^"]+)"|(\w+))\s+as\s+(\w+)/g;
        let match;
        
        while ((match = actorRegex.exec(puml)) !== null) {
            const keyword = match[1];
            const name = match[3] || match[4];
            const id = match[5];
            
            if (!seenNodes.has(id)) {
                const isInsideSystem = systemContent.includes(id);
                nodes.push({ 
                    id, 
                    type: keyword === 'actor' ? 'actor' : (keyword === 'participant' ? 'participant' : 'usecase'), 
                    data: { label: name }, 
                    position: { x: 0, y: 0 },
                    parentId: isInsideSystem ? systemId : undefined
                });
                seenNodes.add(id);
            }
        }

        // 3. Extraer Casos de Uso directos (especialmente dentro del sistema)
        const directUseCaseRegex = /usecase\s+"([^"]+)"\s*(?:as\s+(\w+))?/g;
        let duMatch;
        while ((duMatch = directUseCaseRegex.exec(puml)) !== null) {
            const name = duMatch[1];
            const id = duMatch[2] || name.replace(/\s+/g, '_');
            if (!seenNodes.has(id)) {
                const isInsideSystem = systemContent.includes(name) || (duMatch[2] && systemContent.includes(duMatch[2]));
                nodes.push({ 
                    id, 
                    type: 'usecase', 
                    data: { label: name }, 
                    position: { x: 0, y: 0 },
                    parentId: isInsideSystem ? systemId : undefined
                });
                seenNodes.add(id);
            }
        }

        // 4. Extraer Actores directos
        const directActorRegex = /actor\s+"([^"]+)"\s*(?:as\s+(\w+))?/g;
        let daMatch;
        while ((daMatch = directActorRegex.exec(puml)) !== null) {
            const name = daMatch[1];
            const id = daMatch[2] || name.replace(/\s+/g, '_');
            if (!seenNodes.has(id)) {
                nodes.push({ 
                    id, 
                    type: 'actor', 
                    data: { label: name }, 
                    position: { x: 0, y: 0 }
                });
                seenNodes.add(id);
            }
        }

        // 5. Extraer Relaciones
        const relationRegex = /(\w+)\s+([-.<|>]{1,4})\s+(\w+)(?:\s*:\s*(.+))?/g;
        let edgeCount = 0;
        while ((match = relationRegex.exec(puml)) !== null) {
            const source = match[1];
            const op = match[2];
            const target = match[3];
            const label = match[4] ? match[4].trim() : undefined;

            if (seenNodes.has(source) && seenNodes.has(target)) {
                edges.push({ 
                    id: `e-${source}-${target}-${edgeCount++}`, 
                    source, 
                    target, 
                    label,
                    animated: op.includes('.'),
                    style: { 
                        strokeWidth: op.includes('|') ? 4 : 2.5,
                        strokeDasharray: op.includes('.') ? '5,5' : undefined
                    }
                });
            }
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

    /**
     * Parsea la Matriz de Roles y Permisos.
     */
    static parseRoles(jsonStr: string): { nodes: DiagramNode[], edges: DiagramEdge[] } {
        try {
            const data = JSON.parse(jsonStr);
            const nodes: DiagramNode[] = [];
            const edges: DiagramEdge[] = [];
            
            if (data.roles && Array.isArray(data.roles)) {
                let x = 0;
                let y = 0;
                data.roles.forEach((role: any, idx: number) => {
                    const permissions = data.permission_matrix ? (data.permission_matrix[role.name] || []) : role.permissions;
                    
                    nodes.push({
                        id: `role-${idx}`,
                        type: 'database', // Reutilizamos el estilo de tabla/caja informativa
                        data: {
                            label: role.name,
                            columns: [
                                { name: 'DESCRIPCIÓN', type: role.description },
                                ...permissions.slice(0, 10).map((p: string) => ({ name: '🔑 ' + p, type: 'Permiso' })),
                                { name: permissions.length > 10 ? `... y ${permissions.length - 10} más` : '', type: '' }
                            ]
                        },
                        position: { x, y }
                    });

                    x += 400;
                    if (x > 1200) {
                        x = 0;
                        y += 500;
                    }
                });
            }
            return { nodes, edges };
        } catch (err) {
            console.error("Error parsing roles", err);
            return { nodes: [], edges: [] };
        }
    }
}
