# Sistema de Gestión de Desarrollo - Procedimiento Integral

## FASES DEL PROYECTO

### Fase 0: Inicialización y Factibilidad

**Objetivo:** Transformar el "humo" inicial del cliente o de tu idea en un objeto de datos concreto y estructurado.

#### Procesos

##### Recolección
- Enviar formularios dinámicos o llenar manualmente los datos clave del negocio.

#### Inputs
- Respuestas crudas obtenidas (formularios tipo BANT/NEAT).

#### Outputs

Un registro en la Base de Datos (un mega-objeto JSON) que consolida:

- **Definición del problema:** Qué dolor exacto se resuelve.
- **Mapa de impacto:** Cuánto afecta (tiempo, dinero, etc.).
- **Usuarios y contexto:** Quiénes lo sufren y entorno.
- **Procesos actuales:** Cómo lo resuelven hoy sin tu software.
- **Objetivo del software:** Automatizar, centralizar, escalar, etc.
- **Criterios de éxito:** KPIs (ej. menos errores, ahorro de 2hs diarias).
- **Restricciones iniciales:** Tecnológicas, legales, presupuesto.
- **Nivel de prioridad:** Crítico, importante, accesorio.
- **Visión de crecimiento:** MVP o plataforma escalable.

#### Retroalimentación (El Beneficio)

> Este objeto es el ADN del proyecto. Si el usuario llena todo esto, el sistema le avisa: "¡Excelente! Con esto, en la Fase 1 te voy a generar un prompt perfecto para que una IA te arme todo el esqueleto del software en segundos".

---

### Fase 1: Requisitos y Diseño Visual (El Qué)

**Objetivo:** Usar el ADN de la Fase 0 para estructurar el producto sin escribir una sola tarjeta a mano.

#### Procesos

- **Generación de Prompt de Estructura:** El sistema lee la Fase 0 y arma un prompt maestro.
- **Renderizado del Lienzo 2D (User Story Mapping):** Pegás el resultado de la IA y el sistema dibuja el tablero interactivo.
- **Refinamiento BDD:** Ajustes manuales a los Criterios de Aceptación.

#### Inputs

- Objeto de Contexto de la Fase 0 (automático).
- JSON externo: El resultado que te devolvió ChatGPT/Claude basado en tu prompt (con las Épicas, Historias y Tareas).

#### Outputs

- Tablero visual 2D navegable (User Story Mapping).
- Historias de Usuario con plantillas estrictas y Criterios de Aceptación (BDD) redactados.

#### Retroalimentación (El Beneficio)

> El JSON pegado genera automáticamente un Boceto de Backlog. Te ahorraste crear 50 tickets manualmente. Además, los Criterios BDD quedan anclados para usarse solos como Casos de Prueba en la Fase 4.

---

### Fase 2: Diseño y Arquitectura (El Cómo)

**Objetivo:** Definir las reglas de juego técnicas. Es flexible: llenás lo que necesitás.

#### Procesos

- **Configuración del Stack Tecnológico:** Llenado de un formulario exhaustivo (pero rápido) sobre las herramientas a usar.
- **Modelado y Diagramación (Opcional):** Generación de diagramas vía Prompts (UML, ERD, SiteMaps, Matriz de Roles) usando el mismo formato JSON de la fase anterior.

#### Inputs

- **Formulario de Stack:** IDE, Debugger, Gestor de dependencias, Control de versiones (Git), Estrategia de Ramas (ej. main, dev, feature), Arquitectura (ej. Limpia/La Cebolla), Principios (SOLID), Patrones de Diseño, Tecnologías (ej. Frontend en React, Backend en Java con Spring Boot, BD SQL), Enlaces a documentaciones.
- **JSONs de Diagramas:** Textos estructurados para renderizar diagramas visuales (usando librerías como Mermaid.js o AntV X6 por detrás).

#### Outputs

- Un "Contrato Técnico" anexado al Contexto Global.
- Diagramas visuales vinculados al proyecto.
- Opción de guardar este Stack entero como "Plantilla" para futuros proyectos.

#### Retroalimentación (El Beneficio)

> Acá está la magia. Al llenar todo este stack (ej. "Uso Spring Boot y Clean Architecture"), el sistema inyecta estas reglas en todos los prompts de la Fase 3. El usuario entiende que configurar esto una vez significa no tener que aclararle nunca más a la IA qué tecnologías o arquitectura usa para programar.

---

### Fase 3: Implementación (Ejecución y Equipo)

**Objetivo:** La trinchera. Todo lo anterior viene a facilitar esta etapa.

#### Procesos

- **Gestión de Sprints/Kanban:** Movimiento de tickets, priorización y cálculo de Velocidad (Velocity).
- **Motor de Prompts de Desarrollo:** Uso de plantillas para generar código y configuraciones.
- **Colaboración en Contexto:** Hub de equipo y enlaces.

#### Inputs

- El mini-input manual: "¿Qué querés hacer ahora?" (Ej: "Implementar el módulo de Login" o "Arreglar el bug de la tabla X").
- Feedback del equipo (Ideas, Reportes de Bugs).
- URLs importantes (Repositorios, Dominios de Render/Netlify, Figma).

#### Outputs

- **Prompts Hiper-Específicos:** El sistema escupe el texto listo uniendo: [Tu mini-input] + [Contexto Fase 0] + [Historia de la Fase 1] + [Stack y Arquitectura Fase 2]. Ej: Prompts para Configurar entorno, Codificar, Testear, etc.
- Tablero de trabajo actualizado y central de enlaces unificada.

#### Retroalimentación (El Beneficio)

> Las herramientas de equipo no son un chat suelto; una "Idea" o un "Bug" reportado por un compañero se vincula directamente a un Ticket del Kanban. La retroalimentación al futuro es directa: el sistema mide cuánto tardás (Cycle Time) y calibra automáticamente tu capacidad de estimación.

---

### Fase 4: Pruebas y Calidad (Testing)

**Objetivo:** Validar que las piezas encajen.

#### Procesos

- **Ejecución de Pruebas:** Chequeo de Casos de Prueba Funcionales y No Funcionales.

#### Inputs

- Criterios de Aceptación (BDD) que viajaron solos desde la Fase 1.
- Resultados manuales (Pasó / Falló).

#### Outputs

- Métricas de calidad y matriz de cobertura.

#### Retroalimentación (El Beneficio)

> Si algo falla, no tenés que ir a crear un ticket. El sistema levanta un Bug automáticamente, le pega la etiqueta de Deuda Técnica, y lo inyecta en el Sprint activo de la Fase 3 con todo el contexto de por qué falló.

---

### Fase 5 y Fase 6: Despliegue y Mantenimiento

**Objetivo:** La recolección de los frutos y la preparación para el próximo ciclo.

#### Procesos

- **Lanzamiento y Monitoreo.**
- **Extracción de Conocimiento:** El cierre exponencial.

#### Inputs

- Aprobación final del cliente/Product Owner.

#### Outputs

- Sistema en producción.

#### Retroalimentación (El Beneficio Exponencial)

> El sistema te hace la pregunta clave: "¿Qué parte de este proyecto te quedó increíble?". Podés extraer módulos de código, configuraciones de CI/CD, o el Stack de la Fase 2, y guardarlos en tu Biblioteca Base. Tu próximo proyecto no arranca de cero, arranca de la base de tu éxito anterior.

---

## COMPONENTES Y CARACTERÍSTICAS DEL SISTEMA

### 1. Núcleo y Arquitectura (Seguridad y Usuarios)

#### Multitenant Real (Multiusuario)

Para garantizar que no se filtre un solo dato entre usuarios, a nivel PostgreSQL vamos a usar RLS (Row-Level Security). Básicamente, a nivel motor de base de datos le decimos: "Nadie puede consultar una fila si el `tenant_id` no coincide con el del usuario logueado". Es a prueba de balas.

#### Gestión de Miembros (La Matriz)

Desacoplar el "Rol" de los "Permisos" es la mejor práctica. Podés invitar a Kevin o Mariano a un proyecto de SaaS, ponerles la etiqueta visual de "Full-Stack", pero en la matriz de checks configurar que solo puedan editar la Fase 3 (Kanban) y Fase 4 (Testing), pero que tengan bloqueada la vista de potenciales clientes o costos.

---

### 2. Capa de Negocio (CRM y Clientes)

#### Mini-CRM Integrado

El flujo es perfecto. El formulario público entra como un registro en una tabla de Leads (Potenciales). Si le das "Aprobar", pasa a la tabla Clientes y automáticamente te habilita el botón para crearle un Proyecto asociado.

#### El Link Mágico (Portal de Cliente)

Es la salvación absoluta. Por ejemplo, cuando estés desarrollando el ERP de comidas para tu mamá, en vez de que te llene el WhatsApp de audios o capturas de pantalla, le pasás este link. Ella entra a una vista limpia de solo lectura, ve la demo, y te deja comentarios anclados que a vos te caen directo como tarjetas en tu tablero.

#### Inyección de Formularios

Vamos a estructurarlo para que el sistema te escupa un `<iframe src="tu-anti-jira.com/form/xyz">` o un script de React para embeber en cualquier lado, o bien que te genere una landing page minimalista alojada en tu mismo sistema.

---

### 3. Crecimiento y Portafolio

#### Exportación para Portfolio

Armar un portfolio impecable es clave para salir a buscar clientes fuertes como freelancer. El sistema va a tener un botón que empaquete un JSON con la portada, el stack (de la Fase 2), los diagramas (ERD/Flujos) y una galería de imágenes, listo para ser consumido por la API de tu web personal.

#### Importación Express

Un "Bypass" de las fases. Un formulario rápido de una sola pantalla donde ponés el nombre, subís unas fotos, marcás qué tecnologías usaste y el sistema te crea un "Proyecto Finalizado" directamente para alimentar tu biblioteca y tu portfolio.

#### Gestión de Plantillas

Vamos a tener una sección global tipo "Bóveda" (Vault) donde viven tus stacks guardados, tus plantillas de formularios y tus configuraciones.

---

### 4. Experiencia de Usuario (UX Inmersiva)

#### Modo Enfoque (Focus Mode)

Cuando entrás al Dashboard global ves a tus clientes, tus leads y todos tus espacios. Pero en el momento que hacés clic en un Proyecto, el menú superior y lateral desaparecen o cambian de color, y el sistema se transforma. Solo ves el contexto de ese software, las fases y el equipo asignado. Cero distracciones.