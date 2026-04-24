using System.Text;
using MateCode.Core.Entities;

namespace MateCode.Application.Services
{
    public static class ContextPromptBuilder
    {
        public static string BuildGlobalContextPrompt(Proyecto project, string adn, string stack, string standards, string stories, string tickets)
        {
            var sb = new StringBuilder();
            sb.AppendLine("# CONTEXTO GLOBAL DEL PROYECTO: " + (project?.Nombre ?? "Sin Nombre"));
            sb.AppendLine();

            sb.AppendLine("## 1. ADN (Fase 0)");
            sb.AppendLine(adn);
            sb.AppendLine();

            sb.AppendLine("## 2. STACK Y ARQUITECTURA");
            sb.AppendLine(stack);
            sb.AppendLine();

            sb.AppendLine("## 3. BLUEPRINT (Estándares Técnicos)");
            sb.AppendLine(standards);
            sb.AppendLine();

            sb.AppendLine("## 4. REQUISITOS (Fase 1)");
            sb.AppendLine(stories);
            sb.AppendLine();

            sb.AppendLine("## 5. ESTADO ACTUAL (Kanban)");
            sb.AppendLine(tickets);
            sb.AppendLine();

            sb.AppendLine("---");
            sb.AppendLine("INSTRUCCIÓN PARA LA IA: Has sido inicializada con el estado actual de este proyecto. Responde 'Contexto asimilado, ¿en qué módulo trabajamos hoy?'");

            return sb.ToString();
        }

        public static string BuildBrainstormingPrompt(string idea, string questions, string exampleJson)
        {
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
            sb.AppendLine(questions);
            sb.AppendLine();
            sb.AppendLine("Ejemplo de formato esperado:");
            sb.AppendLine("```json");
            sb.AppendLine(exampleJson);
            sb.AppendLine("```");

            return sb.ToString();
        }
    }
}
