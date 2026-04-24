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

            var contextData = new
            {
                project = new { name = project?.Nombre ?? "MateCode Project" },
                stack = new { 
                    details = string.Join(", ", stack.Select(s => $"{s.Tecnologia?.Nombre} ({s.Tecnologia?.CategoriaPrincipal})")),
                    architecture = "Clean Architecture" 
                },
                standards = string.Join("\n", standards.Select(s => $"- {s.Categoria}: {s.Nombre} - {s.DescripcionDidactica}")),
                context = new { restrictions = "Aplicación de nivel profesional. Seguir el ADN del proyecto." },
                ticket = new { title = ticketTitle, bdd_criteria = bddCriteria },
                user_intent = userIntent
            };

            var template = Template.Parse(AgilePromptBuilder.GetMagicPromptTemplate());
            return await template.RenderAsync(contextData);
        }

        public async Task<string> GetMasterDesignPromptAsync(Proyecto project, IEnumerable<Historia> stories, string diagramType)
        {
            var adn = project?.ContextoJson.ToString() ?? "{}";
            var stack = await _projectService.GetProjectStackAsync(project?.Id ?? Guid.Empty);
            var standards = await _projectService.GetProjectStandardsAsync(project?.Id ?? Guid.Empty);
            var storyMap = await _agileService.GetFullStoryMapAsync(project?.Id ?? Guid.Empty);
            
            return DesignPromptBuilder.BuildMasterPrompt(
                project, adn, 
                string.Join(", ", stack.Select(s => s.Tecnologia?.Nombre)),
                string.Join(", ", standards.Select(s => s.Nombre)),
                storyMap, diagramType);
        }

        public async Task<string> GenerarPromptContextual(Guid templateId, Guid projectId, Guid? ticketId, Guid tenantId, bool? overrideAdn = null, bool? overrideBdd = null, bool? overrideStack = null, string? overridePersona = null, string? overrideTarea = null)
        {
            var template = await _promptLibrary.GetTemplateByIdAsync(templateId, tenantId);
            if (template == null) return "Plantilla no encontrada.";

            var project = await _projectService.GetProjectByIdAsync(projectId);
            var stories = await _agileService.GetStoriesByProjectAsync(projectId);
            var personas = await _agileService.GetPersonasByProjectAsync(projectId);
            var stackList = await _projectService.GetProjectStackAsync(projectId);

            // Preparar datos formateados
            var adnRaw = project?.ContextoJson.ValueKind != JsonValueKind.Undefined && project?.ContextoJson.ValueKind != JsonValueKind.Null
                ? project.ContextoJson.GetRawText()
                : "{}";
            var adnFormatted = DesignPromptBuilder.FormatAdn(adnRaw);
            var stackFormatted = stackList != null && stackList.Any() ? string.Join(", ", stackList.Select(s => s.Tecnologia?.Nombre)) : "Sin stack definido.";
            var storiesFormatted = FormatStories(stories ?? new List<Historia>());
            var personasFormatted = personas != null && personas.Any() 
                ? string.Join("\n", personas.Select(p => $"- {p.Nombre} ({p.Rol})")) 
                : "No se han definido personas/roles para este proyecto.";

            var sb = new StringBuilder();
            
            // Flags para evitar duplicidad si el usuario ya usó placeholders en su plantilla
            bool adnUsed = false;
            bool bddUsed = false;
            bool stackUsed = false;
            bool personasUsed = false;

            // 1. [Identidad persona]
            var personaRaw = !string.IsNullOrEmpty(overridePersona) ? overridePersona : 
                         (string.IsNullOrEmpty(template.BloquePersona) ? "Actúa como un Arquitecto de Software Senior y Experto en Diagramación." : template.BloquePersona);
            
            if (personaRaw.Contains("{ADN_AQUI}")) { personaRaw = personaRaw.Replace("{ADN_AQUI}", adnFormatted); adnUsed = true; }
            if (personaRaw.Contains("{BDD_AQUI}")) { personaRaw = personaRaw.Replace("{BDD_AQUI}", storiesFormatted); bddUsed = true; }
            if (personaRaw.Contains("{STACK_AQUI}")) { personaRaw = personaRaw.Replace("{STACK_AQUI}", stackFormatted); stackUsed = true; }
            if (personaRaw.Contains("{PERSONAS_AQUI}")) { personaRaw = personaRaw.Replace("{PERSONAS_AQUI}", personasFormatted); personasUsed = true; }

            sb.AppendLine(personaRaw);
            sb.AppendLine();

            // 2. [Objetivo / Tarea]
            var tareaRaw = !string.IsNullOrEmpty(overrideTarea) ? overrideTarea :
                        (!string.IsNullOrEmpty(template.BloqueTarea) ? template.BloqueTarea : 
                        (!string.IsNullOrEmpty(template.ContenidoPlantilla) ? template.ContenidoPlantilla : "Generar el diseño técnico detallado basándote en el contexto anterior."));
            
            if (tareaRaw.Contains("{ADN_AQUI}")) { tareaRaw = tareaRaw.Replace("{ADN_AQUI}", adnFormatted); adnUsed = true; }
            if (tareaRaw.Contains("{BDD_AQUI}")) { tareaRaw = tareaRaw.Replace("{BDD_AQUI}", storiesFormatted); bddUsed = true; }
            if (tareaRaw.Contains("{STACK_AQUI}")) { tareaRaw = tareaRaw.Replace("{STACK_AQUI}", stackFormatted); stackUsed = true; }
            if (tareaRaw.Contains("{PERSONAS_AQUI}")) { tareaRaw = tareaRaw.Replace("{PERSONAS_AQUI}", personasFormatted); personasUsed = true; }

            // Solo agregamos el encabezado si la tarea no parece tener uno propio
            if (!tareaRaw.Trim().StartsWith("#")) sb.AppendLine("### OBJETIVO:");
            sb.AppendLine(tareaRaw);
            sb.AppendLine();

            // 3. [Contexto] (Solo lo marcado Y que NO haya sido usado ya en placeholders)
            bool hasContext = (overrideAdn ?? template.InyectaAdn) && !adnUsed || 
                             (overrideStack ?? template.InyectaStack) && !stackUsed || 
                             (overrideBdd ?? template.InyectaBdd) && (!bddUsed || !personasUsed) || 
                             template.InyectaBlueprint;

            if (hasContext)
            {
                sb.AppendLine("### CONTEXTO DEL PROYECTO:");
                
                if ((overrideAdn ?? template.InyectaAdn) && !adnUsed) {
                    sb.AppendLine("#### CONTEXTO ADN (FASE 0):");
                    sb.AppendLine(adnFormatted);
                    sb.AppendLine();
                }

                if ((overrideStack ?? template.InyectaStack) && !stackUsed) {
                    sb.AppendLine($"#### STACK TECNOLÓGICO: {stackFormatted}");
                    sb.AppendLine();
                }

                if (template.InyectaBlueprint) {
                    var standards = await _projectService.GetProjectStandardsAsync(projectId);
                    if (standards != null && standards.Any()) {
                        sb.AppendLine("#### ESTÁNDARES DE CALIDAD:");
                        sb.AppendLine(string.Join("\n", standards.Select(s => $"- {s.Categoria}: {s.Nombre}")));
                        sb.AppendLine();
                    }
                }

                if (overrideBdd ?? template.InyectaBdd) {
                    if (!personasUsed) {
                        sb.AppendLine("#### ROLES Y PERSONAS (FASE 1):");
                        sb.AppendLine(personasFormatted);
                        sb.AppendLine();
                    }
                    
                    if (!bddUsed) {
                        sb.AppendLine("#### HISTORIAS DE USUARIO (FASE 1):");
                        sb.AppendLine(storiesFormatted);
                        sb.AppendLine();
                    }
                }
            }

            // 4. [Formato ideal] (Reglas estrictas del Backend)
            sb.AppendLine("### REGLAS DE FORMATO Y SALIDA (ESTRICTO):");
            
            var diagramType = string.IsNullOrEmpty(template.TipoDiagrama) ? "General" : template.TipoDiagrama;
            switch (diagramType.ToUpper())
            {
                case "ERD":
                    DesignPromptBuilder.AddErdInstructions(sb);
                    break;
                case "SITEMAP":
                    DesignPromptBuilder.AddSitemapInstructions(sb);
                    break;
                case "UML":
                    DesignPromptBuilder.AddUmlInstructions(sb);
                    break;
                case "ROLES":
                    DesignPromptBuilder.AddRolesInstructions(sb);
                    break;
                default:
                    sb.AppendLine("Devolver la respuesta en un formato estructurado y técnico acorde al tipo de diagrama.");
                    break;
            }

            sb.AppendLine();
            sb.AppendLine("IMPORTANTE: Devolvé ÚNICAMENTE el código en crudo, sin bloques de markdown (```) ni explicaciones.");

            return sb.ToString();
        }

        public async Task<string> GenerarPromptBrainstormingAsync(string idea, Guid formularioId, Guid tenantId)
        {
            var form = await _formLibrary.GetFormByIdAsync(formularioId, tenantId);
            if (form == null) return "Error: Formulario no encontrado.";

            using var doc = JsonDocument.Parse(form.ConfiguracionJson.GetRawText());
            var questions = string.Join("\n", doc.RootElement.EnumerateArray().Select(i => $"- {i.GetProperty("pregunta").GetString()} (Etiqueta: {i.GetProperty("etiqueta_semantica").GetString()})"));
            var exampleJson = "{ " + string.Join(", ", doc.RootElement.EnumerateArray().Select(i => $"\"{i.GetProperty("etiqueta_semantica").GetString()}\": \"...\"")) + " }";

            return ContextPromptBuilder.BuildBrainstormingPrompt(idea, questions, exampleJson);
        }

        public async Task<string> GenerarMasterPromptAsync(Guid projectId)
        {
            var project = await _projectService.GetProjectByIdAsync(projectId);
            var stack = await _projectService.GetProjectStackAsync(projectId);
            var standards = await _projectService.GetProjectStandardsAsync(projectId);
            var stories = await _agileService.GetStoriesByProjectAsync(projectId);
            var tickets = await _agileService.GetTicketsByProjectAsync(projectId);

            return ContextPromptBuilder.BuildGlobalContextPrompt(
                project, project?.ContextoJson.ValueKind != JsonValueKind.Null ? project.ContextoJson.GetRawText() : "Sin ADN",
                string.Join(", ", stack.Select(s => s.Tecnologia?.Nombre)),
                string.Join("\n", standards.Select(s => $"- {s.Nombre}")),
                string.Join("\n", stories.Select(s => $"- {s.Titulo}")),
                string.Join("\n", tickets.Where(t => t.Estado != "Completado").Select(t => $"- {t.Titulo}"))
            );
        }

        public async Task<string> GenerarPromptFase1Async(Guid projectId)
        {
            var project = await _projectService.GetProjectByIdAsync(projectId);
            var stack = await _projectService.GetProjectStackAsync(projectId);
            var standards = await _projectService.GetProjectStandardsAsync(projectId);

            return AgilePromptBuilder.BuildPhase1Prompt(
                project, project?.ContextoJson.ValueKind != JsonValueKind.Null ? project.ContextoJson.GetRawText() : "Sin ADN",
                string.Join(", ", stack.Select(s => s.Tecnologia?.Nombre)),
                string.Join("\n", standards.Select(s => s.Nombre))
            );
        }

        private string FormatStories(IEnumerable<Historia> stories)
        {
            if (stories == null || !stories.Any()) return "No hay historias de usuario cargadas.";
            var sb = new StringBuilder();
            foreach (var s in stories)
            {
                sb.AppendLine($"  - {s.Titulo}: {s.CriteriosBdd}");
            }
            return sb.ToString();
        }

        public Task<string> GenerateDesignCodeAsync(string userPrompt, string diagramType) => Task.FromResult("// Simulación: " + diagramType);
    }
}
