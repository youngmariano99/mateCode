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

        public async Task<string> GenerateMagicPromptAsync(string ticketTitle, string bddCriteria, string userIntent)
        {
            // En producción, estos datos provienen de los JSONB de la Base de Datos con JOINs (Fase 0 y Fase 2)
            var contextData = new
            {
                project = new { name = "MateCode AI" },
                stack = new { frontend = "React", backend = ".NET 9", database = "Postgres", architecture = "Clean Architecture" },
                context = new { restrictions = "Aplicación de una sola página (SPA). Cero librerías pesadas para Drag and Drop." },
                ticket = new { title = ticketTitle, bdd_criteria = bddCriteria },
                user_intent = userIntent
            };

            // Plantilla Maestra en Scriban (Zero-Allocation rápida)
            var templateString = @"
Actúa como un Tech Lead Full-Stack Senior. Hablame en español argentino profesional y amigable.

Estamos trabajando en el proyecto ""{{ project.name }}"" bajo estas reglas técnicas:
- Stack: {{ stack.frontend }}, {{ stack.backend }}, {{ stack.database }}
- Arquitectura: {{ stack.architecture }}
- Restricciones comerciales: {{ context.restrictions }}

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
    }
}
