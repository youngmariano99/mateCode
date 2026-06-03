# MÓDULO: crm_y_portal_cliente (Relación y Feedback)

## 1. Objetivo del Módulo
Gestionar el ciclo de vida del cliente desde que es un "Lead" (Potencial) hasta que se le entrega el software. Su funcionalidad estrella es el **"Link Mágico"**, un portal de solo lectura y feedback asíncrono para evitar la gestión de requerimientos por WhatsApp.

## 2. Flujo del Mini-CRM
* **Bandeja de Entrada:** Los formularios llenados caen acá (`crm.leads`). La UI debe mostrar tarjetas simples con la info del cliente.
* **Aprobación:** Un botón de "Aprobar y Crear Proyecto". Esto mueve el registro a `crm.clients` y lanza el wizard del proyecto.

## 3. El Portal del Cliente (Link Mágico)
* **Acceso sin fricción:** El cliente no tiene usuario ni contraseña. Recibe una URL única (Ej: `misistema.com/client/xyz-123`). 
* **Vista de Solo Lectura (ClientLayout):** Al entrar, el cliente ve una UI súper limpia (distinta al Anti-Jira interno). Solo ve:
  * El estado general del proyecto (Ej: "En Desarrollo", "En Pruebas").
  * Demos, videos o capturas de pantalla que el equipo decidió compartirle.
* **Feedback Asíncrono:** El cliente puede dejar comentarios, subir audios o marcar partes de una imagen. 
* **Integración al Kanban:** Ese comentario NO es un chat. Cae directamente en la tabla `agile.client_feedback` y aparece en el Kanban de la Fase 3 del equipo como una "Sugerencia" o "Requisito Nuevo", listo para ser convertido en Ticket.

## 4. Reglas Estrictas para la IA
* **Seguridad Absoluta:** El middleware del backend DEBE verificar el token del Link Mágico y devolver ÚNICAMENTE los datos asociados a ese cliente.
* **Componentización UI:** Usar micro-componentes: `<CrmPipeline />`, `<MagicLinkDashboard />`, `<ClientFeedbackWidget />`.
* **Copywriting:** En el portal del cliente, usar un lenguaje súper transparente y profesional, sin jerga técnica que lo abrume.