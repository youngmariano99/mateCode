using System.Text;
using System.Text.Json;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public static class DesignPromptBuilder
    {
        public static string BuildMasterPrompt(Proyecto? project, string adn, string stack, string standards, object storyMap, string diagramType)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Actúa como un Arquitecto de Software Senior y Experto en Diagramación.");
            sb.AppendLine($"Estamos en la Fase 2 (Diseño) del proyecto \"{project?.Nombre}\".");
            sb.AppendLine();
            
            sb.AppendLine("### 1. CONTEXTO TÉCNICO (FASE 0):");
            sb.AppendLine($"- ADN ESTRATÉGICO:\n{FormatAdn(adn)}");
            sb.AppendLine($"- STACK TECNOLÓGICO: {stack}");
            sb.AppendLine($"- ESTÁNDARES: {standards}");
            sb.AppendLine();

            sb.AppendLine("### 2. JERARQUÍA DE NEGOCIO (FASE 1):");
            sb.AppendLine("Usa esta estructura para identificar entidades, relaciones y flujos:");
            sb.AppendLine(JsonSerializer.Serialize(storyMap, new JsonSerializerOptions { WriteIndented = true }));
            sb.AppendLine();

            sb.AppendLine("### 3. TU TAREA ESPECÍFICA:");
            
            switch (diagramType.ToUpper())
            {
                case "ERD":
                    AddErdInstructions(sb);
                    break;
                case "UML":
                    AddUmlInstructions(sb);
                    break;
                case "SITEMAP":
                    AddSitemapInstructions(sb);
                    break;
                case "ROLES":
                    AddRolesInstructions(sb);
                    break;
                default:
                    sb.AppendLine($"Generar el código para un diagrama de tipo {diagramType.ToUpper()}.");
                    break;
            }

            sb.AppendLine();
            sb.AppendLine("IMPORTANTE: Devolvé ÚNICAMENTE el código en crudo, sin bloques de markdown (```) ni explicaciones.");

            return sb.ToString();
        }

        public static string FormatAdn(string adnRaw)
        {
            if (string.IsNullOrEmpty(adnRaw) || adnRaw == "{}") return "Sin datos estratégicos.";
            try 
            {
                using var doc = JsonDocument.Parse(adnRaw);
                var sb = new StringBuilder();
                
                // Intentamos encontrar el nodo de datos (puede estar envuelto o no)
                JsonElement dataNode = doc.RootElement;
                if (doc.RootElement.TryGetProperty("adn", out var adnNode) && 
                    adnNode.TryGetProperty("data", out var innerData))
                {
                    dataNode = innerData;
                }

                if (dataNode.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in dataNode.EnumerateObject())
                    {
                        var value = prop.Value.ValueKind == JsonValueKind.String 
                                    ? prop.Value.GetString() 
                                    : prop.Value.GetRawText();
                        sb.AppendLine($"  * {prop.Name.ToUpper()}: {value}");
                    }
                    
                    var result = sb.ToString();
                    return string.IsNullOrWhiteSpace(result) ? "Sin datos específicos detallados." : result;
                }
                
                return string.IsNullOrWhiteSpace(adnRaw) ? "Sin datos estratégicos." : adnRaw;
            }
            catch { return string.IsNullOrWhiteSpace(adnRaw) ? "Sin datos estratégicos." : adnRaw; }
        }

        public static void AddErdInstructions(StringBuilder sb)
        {
            sb.AppendLine("Generar un Diagrama de Entidad-Relación (ERD) profesional usando el formato JSON 'UniversalDatabaseSchema'.");
            sb.AppendLine("REGLAS DE ORO:");
            sb.AppendLine("1. Usá 'data_family' para categorizar visualmente (integer, decimal, string, text, boolean, datetime, binary, json, spatial, uuid, array, enum).");
            sb.AppendLine("2. Usá 'engine_overrides' para tipos específicos de motor (ej: { \"postgresql\": \"MONEY\", \"sqlserver\": \"SMALLMONEY\" }).");
            sb.AppendLine("3. Sé EXTREMADAMENTE detallista: incluí auditoría (created_at, updated_at), claves foráneas y tipos de datos precisos.");
            sb.AppendLine();
            sb.AppendLine("EJEMPLO DE POTENCIAL MÁXIMO (Seguí esta estructura exactamente):");
            sb.AppendLine("{");
            sb.AppendLine("  \"project_name\": \"Nombre del Sistema\",");
            sb.AppendLine("  \"default_engine\": \"postgresql\",");
            sb.AppendLine("  \"tables\": [");
            sb.AppendLine("    {");
            sb.AppendLine("      \"id\": \"t1\",");
            sb.AppendLine("      \"name\": \"usuarios\",");
            sb.AppendLine("      \"columns\": [");
            sb.AppendLine("        { \"name\": \"id\", \"data_family\": \"uuid\", \"is_primary_key\": true, \"engine_overrides\": { \"postgresql\": \"UUID DEFAULT gen_random_uuid()\" } },");
            sb.AppendLine("        { \"name\": \"email\", \"data_family\": \"string\", \"is_unique\": true, \"native_type\": \"VARCHAR(255)\" },");
            sb.AppendLine("        { \"name\": \"saldo\", \"data_family\": \"decimal\", \"engine_overrides\": { \"postgresql\": \"NUMERIC(19,4)\", \"sqlserver\": \"MONEY\" } },");
            sb.AppendLine("        { \"name\": \"preferencias\", \"data_family\": \"json\", \"native_type\": \"JSONB\" },");
            sb.AppendLine("        { \"name\": \"ubicacion\", \"data_family\": \"spatial\", \"engine_overrides\": { \"postgresql\": \"GEOMETRY(Point, 4326)\" } }");
            sb.AppendLine("      ]");
            sb.AppendLine("    }");
            sb.AppendLine("  ],");
            sb.AppendLine("  \"relationships\": [");
            sb.AppendLine("    { \"id\": \"r1\", \"type\": \"one_to_many\", \"source_table\": \"usuarios\", \"source_column\": \"id\", \"target_table\": \"pedidos\", \"target_column\": \"usuario_id\" }");
            sb.AppendLine("  ]");
            sb.AppendLine("}");
        }

        public static void AddUmlInstructions(StringBuilder sb)
        {
            sb.AppendLine("IMPORTANTE: Ignorá cualquier instrucción de formato previa. DEBES usar PlantUML.");
            sb.AppendLine("Generar un Diagrama de Secuencia o de Casos de Uso (Use Case) profesional.");
            sb.AppendLine("NUESTRO MOTOR SOPORTA:");
            sb.AppendLine("1. DIAGRAMAS DE CASOS DE USO: Usá 'actor \"Nombre\" as ID' y 'usecase \"Descripción\" as ID'. Soporta herencia (Actor <|-- SubActor) y relaciones punteadas con labels (A ..> B : <<include>>).");
            sb.AppendLine("2. DIAGRAMAS DE SECUENCIA: Usá 'actor' para usuarios y 'participant' para servicios/apps. Soporta mensajes detallados (ID -> ID: Mensaje) y bloques de agrupación (== Título ==).");
            sb.AppendLine();
            sb.AppendLine("ESTILO REQUERIDO:");
            sb.AppendLine("- No uses skinparams (el motor aplica estilos automáticos).");
            sb.AppendLine("- REGLA DE ORO: Los 'usecase' DEBEN ir agrupados dentro de un 'rectangle \"Nombre del Sistema\" { ... }'. Esto es vital para el orden visual.");
            sb.AppendLine("- REGLA DE LEGIBILIDAD: Definí primero todos los actores fuera del rectángulo y luego las conexiones.");
            sb.AppendLine("- Ejemplo Casos de Uso Estructurado:");
            sb.AppendLine("@startuml");
            sb.AppendLine("actor \"Usuario\" as U");
            sb.AppendLine("rectangle \"Sistema MateCode\" {");
            sb.AppendLine("  usecase \"Login\" as L");
            sb.AppendLine("  usecase \"Procesar Datos\" as P");
            sb.AppendLine("}");
            sb.AppendLine("U --> L");
            sb.AppendLine("L ..> P : <<include>>");
            sb.AppendLine("@enduml");
            sb.AppendLine();
            sb.AppendLine("- Ejemplo Secuencia:");
            sb.AppendLine("@startuml\nactor \"Julián\" as Cajero\nparticipant \"API Gateway\" as API\nCajero -> API: Consultar Stock\n@enduml");
        }

        public static void AddSitemapInstructions(StringBuilder sb)
        {
            sb.AppendLine("Generar la arquitectura de navegación (Wiremap) usando el formato JSON 'UniversalSitemap' con soporte de jerarquía de flujo y SEGURIDAD.");
            sb.AppendLine("REGLAS DE ORO PARA CONEXIONES:");
            sb.AppendLine("1. Definí una estructura de árbol (Organigrama).");
            sb.AppendLine("2. Usá 'parentId' para conectar páginas hijas con su nodo padre inmediato.");
            sb.AppendLine();
            sb.AppendLine("REGLAS DE SEGURIDAD Y ROLES:");
            sb.AppendLine("1. Usá el campo 'roles' (array de strings) tanto en páginas como en secciones.");
            sb.AppendLine("2. Mapeá los roles basándote en las 'PERSONAS' identificadas en el contexto de la Fase 1.");
            sb.AppendLine("3. Si no hay personas definidas, simulá roles lógicos (ej: Admin, Colono, Visitante).");
            sb.AppendLine();
            sb.AppendLine("ESPECIFICACIONES DE PÁGINA:");
            sb.AppendLine("- Cada página debe tener un 'id' único, 'name', 'route', 'sections' y 'roles'.");
            sb.AppendLine("- Las secciones deben incluir 'id', 'title', 'description' y 'roles'.");
            sb.AppendLine();
            sb.AppendLine("EJEMPLO DE POTENCIAL MÁXIMO (Seguí esta estructura exactamente):");
            sb.AppendLine("{");
            sb.AppendLine("  \"project_name\": \"Nombre del Sistema\",");
            sb.AppendLine("  \"pages\": [");
            sb.AppendLine("    { \"id\": \"p1\", \"name\": \"Landing\", \"route\": \"/\", \"roles\": [\"Visitante\", \"Colono\"], \"sections\": [{ \"id\": \"s1\", \"title\": \"Hero\", \"description\": \"...\", \"roles\": [\"Visitante\"] }] },");
            sb.AppendLine("    { \"id\": \"p2\", \"name\": \"Admin Dashboard\", \"route\": \"/admin\", \"parentId\": \"p1\", \"roles\": [\"Admin\"], \"sections\": [{ \"id\": \"s2\", \"title\": \"User Management\", \"description\": \"...\", \"roles\": [\"Admin\"] }] }");
            sb.AppendLine("  ]");
            sb.AppendLine("}");
        }

        public static void AddBrandingContext(StringBuilder sb, string brandingJson)
        {
            if (string.IsNullOrEmpty(brandingJson) || brandingJson == "{}") return;
            sb.AppendLine("### 1.2 IDENTIDAD VISUAL (BRANDING):");
            sb.AppendLine(brandingJson);
            sb.AppendLine();
        }

        public static void AddRolesInstructions(StringBuilder sb)
        {
            sb.AppendLine("Generar una matriz de Roles y Permisos detallada en formato JSON.");
            sb.AppendLine("REGLAS:");
            sb.AppendLine("- Definí los roles identificados en las Personas de la Fase 1.");
            sb.AppendLine("- Asigná permisos atómicos (read:orders, write:settings, etc.).");
            sb.AppendLine("- Ejemplo de formato:");
            sb.AppendLine("{ \"roles\": [ { \"name\": \"Admin\", \"permissions\": [\"*\"] } ] }");
        }
    }
}
