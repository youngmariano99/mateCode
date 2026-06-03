# 07_ECOSISTEMA_Y_RETROALIMENTACION: El Motor Vivo del "Anti-Jira"

## 1. Objetivo del Documento
Definir la macro-arquitectura del flujo de datos. El "Anti-Jira" opera bajo la regla suprema de **Fricción Cero y Reutilización Total**: un dato ingresado por el usuario o el cliente en una fase, DEBE viajar automáticamente hacia las fases siguientes para automatizar el trabajo, generar prompts o crear métricas. 



## 2. El Flujo Sanguíneo del Sistema (Interconexiones)
La IA debe construir el backend y el frontend respetando estas tuberías de datos invisibles:

* **Inbound (CRM) -> Fase 0 (Factibilidad):**
  Un Lead llenado en un Iframe externo se aprueba y automáticamente crea el `project_context`. Cero carga manual de datos del cliente.
* **Fase 0 -> Fase 1 (Requisitos):**
  El JSONB de factibilidad (el ADN) es el input directo para que la IA genere el esquema 2D de Épicas e Historias (User Story Mapping).
* **Fase 1 -> Cotizador (Presupuestos):**
  Las Historias de Usuario viajan al Cotizador. El motor de ML.NET/Semantic Kernel las traduce de "Técnico" a "Comercial". Al generar el PDF, el sistema aplica el perfil de la marca (Ej: el logo y colores de AppyStudios).
* **Fase 1 -> Fase 4 (Testing):**
  Los Criterios de Aceptación (BDD) redactados en el tablero 2D se clonan dinámicamente como la Checklist interactiva de Casos de Prueba.
* **Fase 2 (Diseño) + Fase 1 -> Fase 3 (Kanban):**
  El Stack guardado (Ej: React, Spring Boot, Clean Architecture) y la base de datos en DBML se inyectan en el **Motor de Prompts Mágicos** de cada ticket.
* **Portal del Cliente -> Fase 3:**
  El feedback dejado a través del "Link Mágico" (Ej: comentarios sobre la demo de ERP Comidas) viaja directo a la base de datos `agile.client_feedback` y aparece en el Kanban del equipo.
* **Fase 3 -> Fase 3 (El Ciclo de Deuda):**
  Cuando se asigna un ticket de "Deuda Técnica" a un miembro del equipo (Ej: Kevin o Mariano), y el Sprint termina, ese ticket vuelve cíclicamente al Backlog con alta prioridad.
* **Fase 5 -> La Bóveda (Vault):**
  Al terminar el proyecto, el Stack, los Formularios y los Diagramas se empaquetan y guardan. En el próximo proyecto (Ej: Animal Connect), se inician importando estas plantillas en 1 clic.

## 3. Topología de Base de Datos y APIs (Para la IA)
* **Prohibido el Aislamiento:** Al desarrollar un endpoint en .NET para la Fase 3, la IA DEBE considerar hacer un `JOIN` (o consultas asíncronas paralelas) al esquema `vault` y al esquema `projects` para traer el contexto necesario para el Motor de Prompts.
* **Desnormalización Estratégica:** En casos donde la lectura deba ser ultra-rápida (ej. renderizar el tablero Kanban con los tags de diseño de la Fase 2), se permite el uso de vistas materializadas o inyección en JSONB para evitar cuellos de botella.

## 4. Comportamiento UX del Ecosistema
El frontend debe hacerle sentir al usuario que el sistema "trabaja para él".
* **Auto-completado Inteligente:** Si en la Fase 0 el cliente puso que el proyecto es un "E-commerce", los dropdowns de la Fase 2 deben sugerir plantillas de bases de datos para E-commerce guardadas en la Bóveda.
* **Tono de Voz Transversal (Mentor):** El sistema siempre explica el *porqué* de las conexiones. 
  * *Ejemplo al crear un Presupuesto:* "Me traje todas las historias de la Fase 1 y las pasé a un idioma que tu cliente entienda. Revisá los precios y mandale el PDF."
  * *Ejemplo al cosechar en Fase 5:* "¡Este módulo de autenticación te quedó joya! Mandalo a la Bóveda así no lo tenés que programar nunca más."

## 5. Regla de "Bypass" (Flexibilidad)
Aunque el ecosistema es un flujo continuo, el "Anti-Jira" NO es una dictadura. El usuario puede iniciar un proyecto salteándose el CRM, arrancar directamente en la Fase 3 con Kanban puro, o hacer una **Importación Express** solo para armar su Portfolio. La IA debe programar los controladores asumiendo que los campos de fases anteriores pueden ser nulos (`null`).