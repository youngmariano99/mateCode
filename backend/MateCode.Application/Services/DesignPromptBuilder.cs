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
            sb.AppendLine("<system_context>");
            sb.AppendLine("Eres un Arquitecto de Software Senior, DBA y Experto en Diagramación.");
            sb.AppendLine($"Dominio: Diseño de Arquitectura (Fase 2). Proyecto: \"{project?.Nombre}\".");
            sb.AppendLine("</system_context>");
            sb.AppendLine();
            
            sb.AppendLine("<contexto_tecnico_fase_0>");
            sb.AppendLine("- ADN ESTRATÉGICO:");
            sb.AppendLine(FormatAdn(adn));
            sb.AppendLine($"- STACK TECNOLÓGICO: {stack}");
            sb.AppendLine($"- ESTÁNDARES: {standards}");
            sb.AppendLine("</contexto_tecnico_fase_0>");
            sb.AppendLine();

            sb.AppendLine("<jerarquia_de_negocio_fase_1>");
            sb.AppendLine(JsonSerializer.Serialize(storyMap, new JsonSerializerOptions { WriteIndented = true }));
            sb.AppendLine("</jerarquia_de_negocio_fase_1>");
            sb.AppendLine();

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
                    sb.AppendLine("<imperativo_de_tarea>");
                    sb.AppendLine($"Generar el código para un diagrama de tipo {diagramType.ToUpper()}.");
                    sb.AppendLine("</imperativo_de_tarea>");
                    sb.AppendLine("<formato_de_salida_estricto>");
                    sb.AppendLine("- Devolvé ÚNICAMENTE el código en crudo, sin bloques de markdown (```) ni explicaciones.");
                    sb.AppendLine("</formato_de_salida_estricto>");
                    break;
            }

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
            sb.AppendLine("<imperativo_de_tarea>");
            sb.AppendLine("Generar un Diagrama de Entidad-Relación (ERD) profesional capaz de soportar todas las Historias de Usuario de la Fase 1, respetando las restricciones del Stack Tecnológico.");
            sb.AppendLine("</imperativo_de_tarea>");
            sb.AppendLine();
            
            sb.AppendLine("<restricciones_arquitectura_bd>");
            sb.AppendLine("- IDIOMA: Español Argentina, a no ser que sean nombres globalmente usado en ingles, pero la idea es mantener un idioma estandar en todas las tablas.");
            sb.AppendLine("- CLAVES PRIMARIAS DISTRIBUIDAS: No utilices identificadores auto-incrementales (SERIAL/BIGINT). Usa UUIDv4 para todas las PKs. Esto evita cuellos de botella en la inserción concurrente y facilita el futuro sharding o migración de datos sin colisión de IDs.");
            sb.AppendLine("- ESTRATEGIA DE ÍNDICES OBLIGATORIA: Por cada tabla generada, debes definir explícitamente qué columnas llevarán índices. Usa B-Tree para claves foráneas y búsquedas exactas. Si la tabla maneja coordenadas o radios, exige la creación de índices espaciales (GiST o SP-GiST).");
            sb.AppendLine("- INTEGRIDAD A NIVEL DE MOTOR: No delegues todas las validaciones al backend. Implementa restricciones CHECK (ej. valores mayores a cero), UNIQUE compuestos (para evitar condiciones de carrera) y define políticas claras de ON DELETE (Restrict, Cascade, o Set Null) en las claves foráneas.");
            sb.AppendLine("- SOFT DELETES Y AUDITORÍA: Prohibido el borrado físico (DELETE) en entidades transaccionales. Toda tabla debe incluir las columnas created_at, updated_at (con triggers de actualización automática) y deleted_at para borrados lógicos.");
            sb.AppendLine("- TIPOS DE DATOS ESTRICTOS Y NATIVOS: Evita el uso genérico de VARCHAR(255). Usa tipos precisos. Si hay datos con esquemas muy variables, utiliza campos JSONB, pero mantén las relaciones principales en 3FN.");
            sb.AppendLine("- NOMENCLATURA PREDECIBLE: Usa snake_case estricto en minúsculas para tablas y columnas. Las tablas deben estar en plural (ej. usuarios, reportes_incidentes) y las claves foráneas deben seguir el patrón entidad_singular_id (ej. usuario_id).");
            sb.AppendLine("- PREPARACIÓN PARA PARTICIONAMIENTO: En tablas con proyección de alto volumen (ej. registros históricos o telemetría), incluye una clave de partición lógica (como la fecha de creación o la región geográfica) para facilitar el futuro \"Table Partitioning\".");
            sb.AppendLine("- TIPADO NEUTRAL Y VISUAL: Usa 'data_family' para categorizar lógicamente en el renderizador (integer, decimal, string, text, boolean, datetime, binary, json, spatial, uuid, array, enum). Usa 'engine_overrides' para mapeos nativos precisos.");
            sb.AppendLine("</restricciones_arquitectura_bd>");
            sb.AppendLine();
            
            sb.AppendLine("<formato_de_salida_estricto>");
            sb.AppendLine("- Devuelve ÚNICAMENTE un objeto JSON en crudo.");
            sb.AppendLine("- PROHIBIDO usar bloques de markdown (```json o ```).");
            sb.AppendLine("- PROHIBIDO agregar texto explicativo o introductorio.");
            sb.AppendLine("- El formato DEBE seguir exactamente este modelo 'UniversalDatabaseSchema':");
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
            sb.AppendLine("</formato_de_salida_estricto>");
        }

        public static void AddUmlInstructions(StringBuilder sb)
        {
            sb.AppendLine("<imperativo_de_tarea>");
            sb.AppendLine("Generar un Diagrama de Arquitectura en formato PlantUML (Secuencia o Casos de Uso) que modele las Historias de Usuario de la Fase 1.");
            sb.AppendLine("</imperativo_de_tarea>");
            sb.AppendLine();
            sb.AppendLine("<restricciones_arquitectura_uml>");
            sb.AppendLine("- SELECCIÓN INTELIGENTE DE DIAGRAMA: Si el contexto implica múltiples interacciones, llamadas a APIs o pasos lógicos, genera un DIAGRAMA DE SECUENCIA. Si es un mapeo general de permisos y funcionalidades por actor, genera un DIAGRAMA DE CASOS DE USO.");
            sb.AppendLine("- REGLAS PARA DIAGRAMA DE SECUENCIA:");
            sb.AppendLine("  1. Separa físicamente las capas utilizando los tipos correctos: 'actor' (Usuario), 'participant' (API/Frontend), 'database' (BD), 'queue' (Colas).");
            sb.AppendLine("  2. Nomenclatura: Usa verbos claros (ej: SolicitarToken, ValidarPago). En los retornos (-->) incluye códigos HTTP o estados si aplica.");
            sb.AppendLine("  3. Flujos Condicionales: Es OBLIGATORIO usar bloques de control lógicos ('alt / else / end') para manejar caminos felices vs errores.");
            sb.AppendLine("- REGLAS PARA CASOS DE USO:");
            sb.AppendLine("  1. Modularidad: Agrupa los 'usecase' dentro de límites de sistema o módulos usando 'rectangle \"Nombre Módulo\" { ... }'.");
            sb.AppendLine("  2. Verbos: Todo 'usecase' DEBE empezar con un verbo en infinitivo.");
            sb.AppendLine("  3. Relaciones: Diferencia estrictamente dependencias obligatorias (..> : <<include>>) de opcionales (..> : <<extend>>).");
            sb.AppendLine("- ESTILO GENERAL: NO uses 'skinparam'. Nuestro motor aplica sus propios temas corporativos automáticamente.");
            sb.AppendLine("</restricciones_arquitectura_uml>");
            sb.AppendLine();
            sb.AppendLine("<formato_de_salida_estricto>");
            sb.AppendLine("- Devuelve ÚNICAMENTE el código PlantUML en crudo, iniciando con @startuml y terminando con @enduml.");
            sb.AppendLine("- PROHIBIDO usar bloques de markdown (```plantuml o ```) ni agregar texto adicional.");
            sb.AppendLine("</formato_de_salida_estricto>");
        }

        public static void AddSitemapInstructions(StringBuilder sb)
        {
            sb.AppendLine("<imperativo_de_tarea>");
            sb.AppendLine("Generar la arquitectura de navegación y UI (Wiremap/Sitemap) usando el formato JSON 'UniversalSitemap' para modelar el flujo de usuario y seguridad.");
            sb.AppendLine("</imperativo_de_tarea>");
            sb.AppendLine();
            sb.AppendLine("<restricciones_arquitectura_wiremap>");
            sb.AppendLine("- JERARQUÍA ESTRICTA (ÁRBOL): Define la estructura como un organigrama. Toda sub-página debe enlazarse a su padre inmediato mediante el atributo 'parentId'. Si es página raíz, omite el parentId.");
            sb.AppendLine("- ENRUTAMIENTO ESTÁNDAR: El campo 'route' debe seguir patrones lógicos o RESTful (ej. '/', '/app', '/app/usuarios', '/app/usuarios/:id').");
            sb.AppendLine("- SIMETRÍA LÉXICA Y DENSIDAD SEMÁNTICA: Las rutas (URLs) deben ser auto-descriptivas y simétricas. Si defines una ruta '/api/v1/reportes/crear-alerta', su contraparte DEBE ser predictiva (ej. '/api/v1/reportes/cancelar-alerta'). Evita identificadores genéricos como '/api/process' o '/rutas/handle'.");
            sb.AppendLine("- SEGURIDAD POR BARRERAS (RBAC): El campo 'roles' es obligatorio (array de strings). Solo permite nombres de roles extraídos del contexto de las 'Personas' de la Fase 1. Para rutas públicas usa ['Public'].");
            sb.AppendLine("- DESGLOSE MODULAR (UI): Cada página debe tener un array de 'sections' representando los componentes lógicos de React o UI (ej. 'Navbar', 'Hero', 'DataTable', 'ModalForm'). Cada sección también hereda la barrera de 'roles'.");
            sb.AppendLine("- EJEMPLO DE POTENCIAL MÁXIMO (Copia esta estructura estructuralmente):");
            sb.AppendLine("{");
            sb.AppendLine("  \"project_name\": \"Nombre del Sistema\",");
            sb.AppendLine("  \"pages\": [");
            sb.AppendLine("    { \"id\": \"p1\", \"name\": \"Landing\", \"route\": \"/\", \"roles\": [\"Public\"], \"sections\": [{ \"id\": \"s1\", \"title\": \"Hero\", \"description\": \"Llamado a la acción principal\", \"roles\": [\"Public\"] }] },");
            sb.AppendLine("    { \"id\": \"p2\", \"name\": \"Dashboard Admin\", \"route\": \"/admin\", \"parentId\": \"p1\", \"roles\": [\"Admin\", \"SuperAdmin\"], \"sections\": [{ \"id\": \"s2\", \"title\": \"Métricas\", \"description\": \"Gráficos de uso\", \"roles\": [\"Admin\"] }] }");
            sb.AppendLine("  ]");
            sb.AppendLine("}");
            sb.AppendLine("</restricciones_arquitectura_wiremap>");
            sb.AppendLine();
            sb.AppendLine("<formato_de_salida_estricto>");
            sb.AppendLine("- Devuelve ÚNICAMENTE un objeto JSON en crudo.");
            sb.AppendLine("- PROHIBIDO usar bloques de markdown (```json o ```).");
            sb.AppendLine("- PROHIBIDO agregar texto explicativo o introductorio.");
            sb.AppendLine("</formato_de_salida_estricto>");
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
            sb.AppendLine("<imperativo_de_tarea>");
            sb.AppendLine("Generar una matriz de Roles y Permisos detallada cruzando las Personas del sistema con las funcionalidades de la Fase 1, en un formato tabular estricto.");
            sb.AppendLine("</imperativo_de_tarea>");
            sb.AppendLine();
            sb.AppendLine("<restricciones_arquitectura_rbac>");
            sb.AppendLine("- ROLES EXACTOS: Extrae los roles obligatoriamente del array de 'Personas' de la Fase 1. Agrega roles de sistema (ej. 'SuperAdmin') solo si es vital.");
            sb.AppendLine("- FORMATO TABULAR (CRÍTICO): El JSON no debe anidar permisos dentro de cada rol. Debe generar una matriz plana donde cada funcionalidad es una fila, y cada rol es una columna con valor 'SÍ' o 'NO'.");
            sb.AppendLine("- POLÍTICA DEFAULT-DENY: Por defecto, si un rol no necesita explícitamente acceso a un módulo, asígnale 'NO'.");
            sb.AppendLine("- GRANULARIDAD CRUD: Los permisos deben desglosar operaciones (ej: 'Crear Reporte', 'Ver Reportes', 'Eliminar Reporte') en vez de poner 'Gestionar Reportes'.");
            sb.AppendLine("- EJEMPLO DE POTENCIAL MÁXIMO (Copia esta estructura estructuralmente):");
            sb.AppendLine("{");
            sb.AppendLine("  \"roles\": [");
            sb.AppendLine("    { \"name\": \"Admin\", \"description\": \"Control total del sistema\" },");
            sb.AppendLine("    { \"name\": \"Usuario\", \"description\": \"Usuario estándar\" }");
            sb.AppendLine("  ],");
            sb.AppendLine("  \"permission_matrix\": [");
            sb.AppendLine("    {");
            sb.AppendLine("      \"modulo\": \"Gestión de Usuarios\",");
            sb.AppendLine("      \"permiso\": \"Eliminar Usuarios\",");
            sb.AppendLine("      \"Admin\": \"SÍ\",");
            sb.AppendLine("      \"Usuario\": \"NO\"");
            sb.AppendLine("    }");
            sb.AppendLine("  ]");
            sb.AppendLine("}");
            sb.AppendLine("</restricciones_arquitectura_rbac>");
            sb.AppendLine();
            sb.AppendLine("<formato_de_salida_estricto>");
            sb.AppendLine("- Devuelve ÚNICAMENTE un objeto JSON en crudo.");
            sb.AppendLine("- PROHIBIDO usar bloques de markdown (```json o ```).");
            sb.AppendLine("- PROHIBIDO agregar texto explicativo o introductorio.");
            sb.AppendLine("</formato_de_salida_estricto>");
        }
    }
}
