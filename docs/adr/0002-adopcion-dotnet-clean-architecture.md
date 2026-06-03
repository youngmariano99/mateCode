# ADR-0002: Adopción de .NET C# y Clean Architecture para el Backend

## Status

Aceptado

## Contexto

El sistema de gestión de proyectos MateCode ("Anti-Jira") requiere procesar y compilar plantillas de prompts complejas, evaluar flujos de negocio CRM de forma concurrente, y realizar consultas de base de datos multi-tenant de forma aislada a alta velocidad y bajo consumo de memoria. Se analizaron alternativas como Node.js/Express, Python/FastAPI y Go. 

Se requería un lenguaje fuertemente tipado que garantizara robustez en el tipado de entidades de dominio y un ecosistema maduro para la integración de Inteligencia Artificial local y notificaciones distribuidas.

## Decisión

Adoptar **.NET C# (versión 8/9)** como el entorno de ejecución backend y estructurar la solución bajo el patrón de **Clean Architecture (Arquitectura en Capas o Cebolla)**:

1.  **División de Proyectos:**
    *   `MateCode.Core`: Capa interna pura sin dependencias de frameworks externos. Contiene entidades del dominio, agregados y excepciones del sistema.
    *   `MateCode.Application`: Orquestación y casos de uso. Define las interfaces de servicios (`IKanbanService`, `IProyectoService`) y DTOs de comunicación.
    *   `MateCode.Infrastructure`: Implementa accesos a base de datos (PostgreSQL vía Entity Framework Core), mapeos y adaptadores externos (Novu, Ollama/Semantic Kernel).
    *   `MateCode.API`: Controladores Web API expuestos mediante middlewares para validación JWT de Supabase y enrutamiento del inquilino.
2.  **Motor de Base de Datos:** PostgreSQL con políticas de Row-Level Security (RLS) habilitadas y consultas EF Core filtradas de manera transparente mediante Global Query Filters por `tenant_id`.

## Consecuencias

*   (+) Alto rendimiento I/O asíncrono y control de memoria óptimo.
*   (+) Desacoplamiento total del núcleo de negocio frente a cambios de base de datos o librerías externas.
*   (+) Facilidad para realizar pruebas unitarias y de integración sobre los casos de uso independientes.
*   (-) Aumento en la complejidad inicial de setup (creación de 4 subproyectos y referencias cruzadas).
*   (-) Mayor cantidad de código repetitivo (boiletplate) para la transferencia de datos entre capas (DTOs a entidades de dominio).
