using System.Text;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public static class AgilePromptBuilder
    {
        public static string BuildPhase1Prompt(Proyecto project, string adn, string stack, string standards)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"### PROYECTO: {project?.Nombre?.ToUpper()} ###");
            sb.AppendLine("### MATECODE AI: ORÁCULO DE REQUISITOS (FASE 1) ###");
            sb.AppendLine();
            sb.AppendLine("Actúa como un Senior Product Manager y Business Analyst. Tu objetivo es generar un 'User Story Mapping' completo basado en la visión técnica y estratégica del proyecto.");
            sb.AppendLine();

            sb.AppendLine("## 1. CONTEXTO ESTRATÉGICO (ADN - FASE 0)");
            sb.AppendLine(DesignPromptBuilder.FormatAdn(adn));
            sb.AppendLine();

            sb.AppendLine("## 2. STACK TECNOLÓGICO");
            sb.AppendLine(stack);
            sb.AppendLine();

            sb.AppendLine("## 3. BLUEPRINT Y ESTÁNDARES");
            sb.AppendLine(standards);
            sb.AppendLine();

            sb.AppendLine("## TU TAREA:");
            sb.AppendLine("Diseñá un 'User Story Map' bidimensional detallado (Jeff Patton style). Debés devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura estricta:");
            sb.AppendLine();
            sb.AppendLine(GetStoryMapJsonTemplate());
            sb.AppendLine();
            sb.AppendLine("REGLAS:");
            sb.AppendLine("1. EJE HORIZONTAL: Epics agrupan Features (pasos narrativos).");
            sb.AppendLine("2. EJE VERTICAL (RELEASES): Realizá el 'Slicing' en al menos 3 releases (V1, V2, V3).");
            sb.AppendLine("3. PERSONAS: Identificá actores clave. El campo 'user' en cada 'user_story' DEBE ser el nombre de una de las personas definidas en la lista 'personas'.");
            sb.AppendLine("4. STORY MAPPING: Cada 'user_story' DEBE tener un 'release_id' válido.");
            sb.AppendLine("5. FORMATO: Solo JSON crudo, sin bloques markdown ni texto adicional.");

            return sb.ToString();
        }

        public static string GetMagicPromptTemplate()
        {
            return @"
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
        }

        private static string GetStoryMapJsonTemplate()
        {
            return @"{
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
}";
        }
    }
}
