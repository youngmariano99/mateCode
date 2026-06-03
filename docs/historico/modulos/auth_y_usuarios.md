# MÓDULO: auth_y_usuarios (Núcleo de Seguridad y Accesos)

## 1. Objetivo del Módulo
Gestionar la identidad, el aislamiento de datos (Multitenancy) y los permisos de los usuarios dentro de la plataforma. Su propósito principal es garantizar que NINGÚN dato se filtre entre diferentes Espacios de Trabajo (Workspaces) y que la asignación de permisos sea hiper-flexible a través de una matriz.

## 2. Multitenant Real (Seguridad Innegociable)
* **Arquitectura de Aislamiento:** El sistema funciona bajo un modelo Multitenant estricto. La columna vertebral de esto es el `tenant_id` (que equivale al ID del Espacio de Trabajo actual).
* **Row-Level Security (RLS):** A nivel motor de base de datos (PostgreSQL), se implementan políticas RLS. 
  * *Regla para la IA:* Toda consulta generada (SELECT, UPDATE, DELETE, INSERT) debe estar protegida implícita o explícitamente por el contexto del `tenant_id` del usuario logueado. Prohibido exponer datos cruzados.

## 3. Gestión de Miembros (Roles vs. Permisos)
El sistema rechaza el modelo clásico de roles rígidos. Se utiliza un modelo desacoplado:
* **Rol Visual (Etiqueta):** Es un simple string (("Product Owner", "Scrum Master", "Frontend Developer", "Backend Developer", "Fullstack Developer", "QA Tester", "UX/UI Designer", "DevOps Engineer", "Data Engineer")
 ). Sirve para la UI y la organización humana.
* **Matriz de Permisos (La Verdad):** Los accesos reales se guardan en la columna `permissions_matrix` (formato JSONB).
  * *Estructura:* Un objeto con *checks* booleanos para cada módulo y fase. Ej: `{ "fase_3_kanban": { "view": true, "edit": true }, "crm_clientes": { "view": false, "edit": false } }`.
  * *Regla para la IA:* La validación de permisos en el Backend y Frontend NO se hace preguntando "si el usuario es Admin", se hace evaluando la propiedad específica dentro de la matriz JSONB.

## 4. Flujo de Invitación y Onboarding
* **Invitaciones por Email:** Los administradores del proyecto invitan a miembros por correo. Si el usuario no tiene cuenta, se lo redirige a un flujo de registro simplificado y se lo asocia automáticamente al Workspace tras verificar el mail.
* **Tono de Voz (UX):** Los correos y pantallas de invitación deben ser alentadores. 
  * *Ejemplo de Copy:* "¡Te invitaron a colaborar! Sumate al espacio de trabajo para empezar a mover tickets y aportar ideas al instante."

## 5. Reglas Estrictas para la Generación de Código (IA)
* **Librerías de Autenticación:** Utilizar la librería estándar definida en el stack (ej. Supabase Auth, o Identity en .NET dependiendo de la configuración final del `00_CONTEXTO_GLOBAL.md`). NO reinventar la rueda con criptografía manual de contraseñas.
* **UI de Gestión de Miembros:** La vista de configuración de equipo debe mostrar la lista de usuarios y un componente tipo tabla interactiva (Matriz) para tildar y destildar accesos fácilmente. 
* **Modo Enfoque:** El módulo de autenticación (Login/Registro) utiliza el `PublicLayout` (sin distracciones). La gestión de usuarios y roles utiliza el `GlobalLayout` (menú general).