using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using Scriban;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public class PromptEngineService : IPromptEngineService
    {
        private readonly IPromptLibraryService _promptLibrary;
        private readonly IProjectService _projectService;
        private readonly IAgileService _agileService;
        private readonly IFormLibraryService _formLibrary;

        public PromptEngineService(
            IPromptLibraryService promptLibrary,
            IProjectService projectService,
            IAgileService agileService,
            IFormLibraryService formLibrary) 
        { 
            _promptLibrary = promptLibrary;
            _projectService = projectService;
            _agileService = agileService;
            _formLibrary = formLibrary;
        }

        public async Task<string> GenerateMagicPromptAsync(Guid projectId, string ticketTitle, string bddCriteria, string userIntent)
        {
            var project = await _projectService.GetProjectByIdAsync(projectId);
            var standards = await _projectService.GetProjectStandardsAsync(projectId);
            var stack = await _projectService.GetProjectStackAsync(projectId);

            var standardsText = string.Join("\n", standards.Select(s => $"- {s.Categoria}: {s.Nombre} - {s.DescripcionDidactica}"));
            
            var stackText = string.Join(", ", stack.Select(s => $"{s.Tecnologia?.Nombre} ({s.Tecnologia?.CategoriaPrincipal})"));

            var contextData = new
            {
                project = new { name = project?.Nombre ?? "MateCode Project" },
                stack = new { 
                    details = stackText,
                    frontend = stack.FirstOrDefault(s => s.Tecnologia?.CategoriaPrincipal == "Frontend")?.Tecnologia?.Nombre ?? "Por definir",
                    backend = stack.FirstOrDefault(s => s.Tecnologia?.CategoriaPrincipal == "Backend")?.Tecnologia?.Nombre ?? "Por definir",
                    database = stack.FirstOrDefault(s => s.Tecnologia?.CategoriaPrincipal == "Base de Datos")?.Tecnologia?.Nombre ?? "Por definir",
                    architecture = "Clean Architecture" 
                },
                standards = standardsText,
                context = new { restrictions = "Aplicación de nivel profesional. Seguir el ADN del proyecto." },
                ticket = new { title = ticketTitle, bdd_criteria = bddCriteria },
                user_intent = userIntent
            };

            // Plantilla Maestra en Scriban
            var templateString = @"
Actúa como un Tech Lead Full-Stack Senior. Hablame en español argentino profesional y amigable.

Estamos trabajando en el proyecto ""{{ project.name }}"" bajo estas reglas técnicas:
- Stack Completo: {{ stack.details }}
- Arquitectura: {{ stack.architecture }}
- Restricciones comerciales: {{ context.restrictions }}

REGLAS A SEGUIR (BLUEPRINT):
{{ standards }}

Tu tarea es implementar la siguiente Historia de Usuario:
TÍTULO: {{ ticket.title }}
CRITERIOS DE ACEPTACIÓN (BDD):
{{ ticket.bdd_criteria }}

El desarrollador te solicita específicamente esto: ""{{ user_intent }}""

Generá el código necesario respetando rigurosamente los principios SOLID y separando responsabilidades. Explicame rápido qué hiciste al principio.";

            var template = Template.Parse(templateString);
            var result = await template.RenderAsync(contextData);
            
            // Aquí podríamos pasar el result al _kernel.InvokeAsync si la IA corrío auto en el mismo backend, 
            // pero el requerimiento es devolver el prompt al portapapeles del frontend.
            return result;
        }

        public async Task<string> GenerateDesignCodeAsync(string userPrompt, string diagramType)
        {
            // Simulación de llamada a Semantic Kernel / OpenAI
            await Task.Delay(1500); // Simular latencia de "Pensando..."

            if (diagramType.ToUpper() == "ERD")
            {
                return "Table usuarios {\n  id uuid [pk]\n  email varchar\n}\nTable perfiles {\n  id uuid [pk]\n  usuario_id uuid [ref: > usuarios.id]\n  nombre varchar\n  bio text\n}";
            }
            
            if (diagramType.ToUpper() == "FLOWCHART" || diagramType.ToUpper() == "UML")
            {
                return "@startuml\nactor \"Usuario\" as U\nparticipant \"Sistema\" as S\nU -> S: Iniciar Sesión\nS -> U: Confirmar Acceso\n@enduml";
            }

            return "// Generación IA para " + diagramType + ": " + userPrompt;
        }

        public async Task<string> GetMasterDesignPromptAsync(Proyecto project, IEnumerable<Historia> stories, string diagramType)
        {
            var adn = project?.ContextoJson.ToString() ?? "{}";
            
            var prompt = $@"Actúa como un Arquitecto de Software Senior y Experto en Diagramación.
Estamos en la Fase 2 (Diseño) del proyecto ""{project?.Nombre}"".

CONTEXTO ADN (FASE 0):
{adn}

HISTORIAS DE USUARIO Y CRITERIOS BDD (FASE 1):
{string.Join("\n", stories.Select(s => $"- {s.Titulo}: {s.CriteriosBdd}"))}

TU TAREA:
Generar el código para un diagrama de tipo {diagramType.ToUpper()}.

REGLAS DE FORMATO:
1. Si es ERD: Devolvé solo código DBML válido.
2. Si es UML o Sitemap: Devolvé solo código PlantUML.
3. Si es Roles: Devolvé un JSON con la estructura: {{ ""roles"": [ {{ ""name"": ""..."", ""permissions"": [] }} ] }}.

IMPORTANTE: Devolvé ÚNICAMENTE el código en crudo, sin bloques de markdown (```) ni explicaciones.";

            return prompt;
        }

        public async Task<string> GenerarPromptContextual(Guid templateId, Guid projectId, Guid? ticketId, Guid tenantId, bool? overrideAdn = null, bool? overrideBdd = null, bool? overrideStack = null)
        {
            var template = await _promptLibrary.GetTemplateByIdAsync(templateId, tenantId);
            if (template == null) return "Plantilla no encontrada.";

            var finalPrompt = template.ContenidoPlantilla;
            
            bool shouldInyectAdn = overrideAdn ?? template.InyectaAdn;
            bool shouldInyectBdd = overrideBdd ?? template.InyectaBdd;
            bool shouldInyectStack = overrideStack ?? template.InyectaStack;

            // Inyectar ADN (Fase 0)
            if (shouldInyectAdn)
            {
                var project = await _projectService.GetProjectByIdAsync(projectId);
                finalPrompt = finalPrompt.Replace("{ADN_AQUI}", project?.ContextoJson.ToString() ?? "{}");
            }
            else
            {
                finalPrompt = finalPrompt.Replace("{ADN_AQUI}", "[Contexto ADN no solicitado]");
            }

            // Inyectar BDD (Fase 1)
            if (shouldInyectBdd)
            {
                var stories = await _agileService.GetStoriesByProjectAsync(projectId);
                var bddText = string.Join("\n", stories.Select(s => $"- {s.Titulo}: {s.CriteriosBdd}"));
                finalPrompt = finalPrompt.Replace("{BDD_AQUI}", bddText);
            }
            else
            {
                finalPrompt = finalPrompt.Replace("{BDD_AQUI}", "[Contexto Historias de Usuario no solicitado]");
            }

            // Inyectar Ticket (Fase 3 - Contexto de ejecución)
            if (template.InyectaTicket && ticketId.HasValue)
            {
                finalPrompt = finalPrompt.Replace("{TICKET_ID}", ticketId.Value.ToString());
            }

            // Inyectar Estándares (Blueprint)
            var projectStandards = await _projectService.GetProjectStandardsAsync(projectId);

            var blueprintText = "REGLAS A SEGUIR (BLUEPRINT):\n" + 
                               string.Join("\n", projectStandards.Select(s => $"- {s.Categoria}: {s.Nombre} - {s.DescripcionDidactica}"));
            
            finalPrompt = finalPrompt.Replace("{BLUEPRINT_AQUI}", blueprintText);

            // Inyectar Stack (Estación 2)
            if (shouldInyectStack)
            {
                var projectStack = await _projectService.GetProjectStackAsync(projectId);
                var stackText = string.Join(", ", projectStack.Select(s => $"{s.Tecnologia?.Nombre} ({s.Tecnologia?.CategoriaPrincipal})"));
                finalPrompt = finalPrompt.Replace("{STACK_AQUI}", stackText);
            }
            else
            {
                finalPrompt = finalPrompt.Replace("{STACK_AQUI}", "[Stack Tecnológico no solicitado]");
            }

            return finalPrompt;
        }

        public async Task<string> GenerarPromptBrainstormingAsync(string idea, Guid formularioId, Guid tenantId)
        {
            var form = await _formLibrary.GetFormByIdAsync(formularioId, tenantId);

            if (form == null) return "Error: Formulario no encontrado.";

            var sb = new StringBuilder();
            sb.AppendLine("### MATECODE AI BRAINSTORMING ORACLE ###");
            sb.AppendLine();
            sb.AppendLine($"Tengo esta idea inicial: \"{idea}\"");
            sb.AppendLine();
            sb.AppendLine("Actúa como un Senior Product Manager y Arquitecto de Software. Tu tarea es analizar esta idea y completar las siguientes preguntas para estructurar el ADN del proyecto.");
            sb.AppendLine();
            sb.AppendLine("Reglas Estrictas:");
            sb.AppendLine("1. Responde de forma técnica, concisa y profesional.");
            sb.AppendLine("2. Devuelve ÚNICAMENTE un objeto JSON válido donde las llaves sean las 'etiqueta_semantica' listadas abajo.");
            sb.AppendLine("3. No incluyas bloques de markdown, ni saludos, ni explicaciones externas.");
            sb.AppendLine();
            sb.AppendLine("Preguntas a responder y sus etiquetas:");
            
            using var doc = JsonDocument.Parse(form.ConfiguracionJson.GetRawText());
            foreach (var item in doc.RootElement.EnumerateArray())
            {
                var pregunta = item.GetProperty("pregunta").GetString();
                var etiqueta = item.GetProperty("etiqueta_semantica").GetString();
                sb.AppendLine($"- {pregunta} (Etiqueta: {etiqueta})");
            }

            var exampleJson = "{ " + string.Join(", ", doc.RootElement.EnumerateArray().Select(i => $"\"{i.GetProperty("etiqueta_semantica").GetString()}\": \"...\"")) + " }";

            sb.AppendLine();
            sb.AppendLine("Ejemplo de formato esperado:");
            sb.AppendLine("```json");
            sb.AppendLine(exampleJson);
            sb.AppendLine("```");

            return sb.ToString();
        }

        public async Task<string> GenerarMasterPromptAsync(Guid projectId)
        {
            var project = await _projectService.GetProjectByIdAsync(projectId);
            var stack = await _projectService.GetProjectStackAsync(projectId);
            var standards = await _projectService.GetProjectStandardsAsync(projectId);
            var stories = await _agileService.GetStoriesByProjectAsync(projectId);
            var tickets = await _agileService.GetTicketsByProjectAsync(projectId);

            var sb = new StringBuilder();
            sb.AppendLine("# CONTEXTO GLOBAL DEL PROYECTO: " + (project?.Nombre ?? "Sin Nombre"));
            sb.AppendLine();

            sb.AppendLine("## 1. ADN (Fase 0)");
            sb.AppendLine(project?.ContextoJson.ToString() ?? "Sin datos de ADN definidos.");
            sb.AppendLine();

            sb.AppendLine("## 2. STACK Y ARQUITECTURA");
            if (stack.Any())
            {
                foreach (var s in stack)
                {
                    sb.AppendLine($"- {s.Tecnologia?.Nombre} ({s.Tecnologia?.CategoriaPrincipal})");
                }
            }
            else
            {
                sb.AppendLine("Stack tecnológico no definido.");
            }
            sb.AppendLine();

            sb.AppendLine("## 3. BLUEPRINT (Estándares Técnicos)");
            if (standards.Any())
            {
                foreach (var s in standards)
                {
                    sb.AppendLine($"- {s.Categoria}: {s.Nombre} - {s.DescripcionDidactica}");
                }
            }
            else
            {
                sb.AppendLine("Estándares de arquitectura no definidos.");
            }
            sb.AppendLine();

            sb.AppendLine("## 4. REQUISITOS (Fase 1)");
            if (stories.Any())
            {
                foreach (var s in stories)
                {
                    sb.AppendLine($"### {s.Titulo}");
                    sb.AppendLine(s.CriteriosBdd);
                    sb.AppendLine();
                }
            }
            else
            {
                sb.AppendLine("No se han definido historias de usuario todavía.");
            }
            sb.AppendLine();

            sb.AppendLine("## 5. ESTADO ACTUAL (Kanban)");
            var pendingTickets = tickets.Where(t => t.Estado != "Completado").ToList();
            if (pendingTickets.Any())
            {
                foreach (var t in pendingTickets)
                {
                    sb.AppendLine($"- [{t.Estado}] {t.Tipo}: {t.Titulo}");
                }
            }
            else
            {
                sb.AppendLine("No hay tickets pendientes.");
            }
            sb.AppendLine();

            sb.AppendLine("---");
            sb.AppendLine("INSTRUCCIÓN PARA LA IA: Has sido inicializada con el estado actual de este proyecto. Responde 'Contexto asimilado, ¿en qué módulo trabajamos hoy?'");

            return sb.ToString();
        }

        public async Task<string> GenerarPromptFase1Async(Guid projectId)
        {
            var project = await _projectService.GetProjectByIdAsync(projectId);
            var stack = await _projectService.GetProjectStackAsync(projectId);
            var standards = await _projectService.GetProjectStandardsAsync(projectId);

            var sb = new StringBuilder();
            sb.AppendLine("### MATECODE AI: ORÁCULO DE REQUISITOS (FASE 1) ###");
            sb.AppendLine();
            sb.AppendLine("Actúa como un Senior Product Manager y Business Analyst. Tu objetivo es generar un 'User Story Mapping' completo basado en la visión técnica y estratégica del proyecto.");
            sb.AppendLine();

            sb.AppendLine("## 1. CONTEXTO ESTRATÉGICO (ADN - FASE 0)");
            var adnRaw = project?.ContextoJson.ToString();
            if (string.IsNullOrEmpty(adnRaw) || adnRaw == "{}" || adnRaw == "null")
            {
                sb.AppendLine("> ⚠️ [AVISO]: Todavía no se ha consolidado el ADN detallado de este proyecto. Generá una propuesta basada en el nombre del proyecto, pero recordá que con el ADN completo la precisión sería mucho mayor.");
            }
            else
            {
                try {
                    using var doc = JsonDocument.Parse(adnRaw);
                    if (doc.RootElement.TryGetProperty("adn", out var adnNode) && adnNode.TryGetProperty("data", out var dataNode))
                    {
                        foreach (var prop in dataNode.EnumerateObject())
                        {
                            sb.AppendLine($"- {prop.Name.ToUpper()}: {prop.Value.GetString()}");
                        }
                    }
                    else
                    {
                        sb.AppendLine(adnRaw);
                    }
                } catch {
                    sb.AppendLine(adnRaw);
                }
            }
            sb.AppendLine();

            sb.AppendLine("## 2. STACK TECNOLÓGICO");
            if (stack == null || !stack.Any())
            {
                sb.AppendLine("> 💡 [CONSEJO]: No se ha definido el Stack tecnológico aún. Si eliges uno en la Fase 0, podré darte historias de usuario con criterios de aceptación técnicos mucho más específicos.");
            }
            else
            {
                foreach (var s in stack)
                {
                    sb.AppendLine($"- {s.Tecnologia?.Nombre} ({s.Tecnologia?.CategoriaPrincipal})");
                }
            }
            sb.AppendLine();

            sb.AppendLine("## 3. BLUEPRINT Y ESTÁNDARES");
            if (standards == null || !standards.Any())
            {
                sb.AppendLine("> ⚠️ [AVISO]: No hay estándares de ingeniería seleccionados. Las historias de usuario serán generales.");
            }
            else
            {
                foreach (var s in standards)
                {
                    sb.AppendLine($"- {s.Categoria}: {s.Nombre}");
                }
            }
            sb.AppendLine();

            sb.AppendLine("## TU TAREA:");
            sb.AppendLine("Diseñá un 'User Story Map' bidimensional detallado (Jeff Patton style). Debés devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura estricta:");
            sb.AppendLine();
            sb.AppendLine(@"{
  ""proyecto"": ""Nombre del Proyecto"",
  ""personas"": [ { ""id"": ""p1"", ""nombre"": ""Laura"", ""rol"": ""Usuario"" } ],
  ""releases"": [ 
    { ""id"": ""v1"", ""nombre"": ""Version 1 (MVP)"", ""descripcion"": ""Core funcional"" },
    { ""id"": ""v2"", ""nombre"": ""Version 2"", ""descripcion"": ""Mejoras"" }
  ],
  ""epics"": [
    {
      ""id"": ""e1"",
      ""nombre"": ""Nombre Epic"",
      ""color"": ""#hex"",
      ""features"": [
        {
          ""id"": ""f1"",
          ""nombre"": ""Nombre Feature"",
          ""color"": ""#hex"",
          ""user_stories"": [
            { 
              ""id"": ""us1"", 
              ""titulo"": ""Como... quiero... para..."", 
              ""user"": ""Laura"", 
              ""release_id"": ""v1"", 
              ""prioridad"": ""MVP"",
              ""bdd"": ""Dado que... cuando... entonces..."",
              ""criterios_aceptacion"": [""check 1"", ""check 2""]
            }
          ]
        }
      ]
    }
  ]
}");
            sb.AppendLine();
            sb.AppendLine("REGLAS:");
            sb.AppendLine("1. EJE HORIZONTAL: Epics agrupan Features (pasos narrativos).");
            sb.AppendLine("2. EJE VERTICAL (RELEASES): Realizá el 'Slicing' en al menos 3 releases (V1, V2, V3).");
            sb.AppendLine("3. PERSONAS: Identificá actores clave. El campo 'user' en cada 'user_story' DEBE ser el nombre de una de las personas definidas en la lista 'personas'.");
            sb.AppendLine("4. STORY MAPPING: Cada 'user_story' DEBE tener un 'release_id' válido.");
            sb.AppendLine("5. FORMATO: Solo JSON crudo, sin bloques markdown ni texto adicional.");

            return sb.ToString();
        }
    }
}
