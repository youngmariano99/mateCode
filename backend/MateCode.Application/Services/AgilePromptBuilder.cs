using System.Text;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public static class AgilePromptBuilder
    {
        public static string BuildPhase1Prompt(Proyecto project, string adn, string stack, string standards)
        {
            var adnContext = DesignPromptBuilder.FormatAdn(adn);

            return $@"<system_context>
Eres un Product Manager Senior y Agile Coach.
Dominio: Estrategia de Producto y User Story Mapping (Fase 1).
</system_context>

<contexto_del_proyecto>
### PROYECTO: {project?.Nombre?.ToUpper()} ###

## 1. CONTEXTO ESTRATÉGICO (ADN - FASE 0)
{adnContext}

## 2. STACK TECNOLÓGICO
{stack}

## 3. BLUEPRINT Y ESTÁNDARES
{standards}
</contexto_del_proyecto>

<imperativo_de_tarea>
Diseñar un 'User Story Map' bidimensional detallado (Jeff Patton style) basado en la visión estratégica, el stack tecnológico y las reglas de negocio del proyecto.
</imperativo_de_tarea>

<restricciones_criticas>
- MANTÉN LA COHERENCIA TÉCNICA: Las historias de usuario deben tener sentido con el Stack Tecnológico elegido y los Estándares de Calidad.
- EJE HORIZONTAL (EPICS): Agrupa la narrativa del usuario en Epics lógicas, y éstas en Features (pasos narrativos).
- EJE VERTICAL (RELEASES): Realiza un 'Slicing' vertical en al menos 3 releases claras (Ej: V1 MVP, V2 Mejoras, V3 Escalamiento).
- PERSONAS: Identifica a los actores clave basándote en el ADN. El campo 'user' en cada 'user_story' DEBE coincidir con el nombre de una de las personas definidas en tu lista de 'personas'.
- MAPEO ESTRICTO: Cada 'user_story' DEBE tener un 'release_id' válido y declarado en tu arreglo de releases.
</restricciones_criticas>

<formato_de_salida_estricto>
- Devuelve ÚNICAMENTE un objeto JSON válido, sin bloques de código markdown, sin introducciones ni conclusiones.
- El JSON debe estructurarse obligatoriamente de la siguiente manera:
{GetStoryMapJsonTemplate()}
</formato_de_salida_estricto>";
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
