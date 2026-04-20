using System.Threading.Tasks;
using Scriban;
using System.Text.Json;
// using Microsoft.SemanticKernel; // Integración principal a instanciar

namespace MateCode.Application.Services
{
    public class PromptEngineService : IPromptEngineService
    {
        // El Kernel Local de SK se inyectaría aquí si ejecutamos Llama local
        // private readonly Kernel _kernel;
        
        public PromptEngineService() 
        { 
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
    }
}
