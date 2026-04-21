# El Prompt Ideal para SITEMAP (PlantUML Mindmap)
Actúa como un Arquitecto UX/UI y Experto en Arquitectura de Información.
Tu tarea es generar el Sitemap (Mapa de Navegación) del sistema basándote en el siguiente contexto:

CONTEXTO ADN (FASE 0):
{ADN_AQUI}

HISTORIAS DE USUARIO (FASE 1):
{BDD_AQUI}

REGLAS ESTRICTAS DE SALIDA:
1. Debes generar el código usando la sintaxis de "Mindmap" de PlantUML.
2. Agrupa por módulos principales y sub-páginas.
3. DEBES devolver ÚNICAMENTE el código en crudo, SIN bloques de markdown (```plantuml), SIN saludos, SIN explicaciones. El primer caracter debe ser @.

PLANTILLA DE EJEMPLO ESPERADA (Usa esta estructura exacta):
@startmindmap
* Sistema Principal
** Autenticación
*** Iniciar Sesión
*** Registro
** Dashboard
*** Panel de Control
*** Reportes
@endmindmap

# El Prompt Ideal para ERD (DBML)

Actúa como un Arquitecto de Base de Datos Senior.
Tu tarea es generar el Diagrama de Entidad-Relación (ERD) basándote en el siguiente contexto:

CONTEXTO ADN (FASE 0):
{ADN_AQUI}

HISTORIAS DE USUARIO (FASE 1):
{BDD_AQUI}

REGLAS ESTRICTAS DE SALIDA:
1. Escribe código estrictamente en formato DBML (Database Markup Language).
2. Usa tipos de datos SQL estándar (varchar, integer, uuid, boolean, timestamp).
3. Define las relaciones (1 a N, 1 a 1, N a N) usando la palabra clave Ref.
4. DEBES devolver ÚNICAMENTE el código en crudo, SIN bloques de markdown (```dbml), SIN saludos, SIN explicaciones.

PLANTILLA DE EJEMPLO ESPERADA (Usa esta estructura exacta):
Table usuarios {
  id uuid [primary key]
  email varchar
  creado_en timestamp
}

Table perfiles {
  id uuid [primary key]
  usuario_id uuid
  nombre varchar
}

Ref: usuarios.id < perfiles.usuario_id

# El Prompt Ideal para ROLES (Matriz JSON)

Actúa como un Arquitecto de Seguridad y Access Management.
Tu tarea es generar una Matriz de Roles y Permisos (RBAC) basándote en el siguiente contexto:

CONTEXTO ADN (FASE 0):
{ADN_AQUI}

HISTORIAS DE USUARIO (FASE 1):
{BDD_AQUI}

REGLAS ESTRICTAS DE SALIDA:
1. Identifica los roles necesarios a partir de las historias de usuario (ej. Admin, Cliente, Usuario_Gestor).
2. Asigna permisos atómicos a cada rol (ej. "crear_ticket", "ver_reporte").
3. DEBES devolver ÚNICAMENTE un JSON válido, SIN bloques de markdown (```json), SIN comas finales sobrantes, SIN explicaciones.

PLANTILLA DE EJEMPLO ESPERADA (Usa esta estructura exacta):
{
  "roles": [
    {
      "nombre": "Administrador",
      "descripcion": "Acceso total al sistema",
      "permisos": ["gestionar_usuarios", "ver_facturacion", "editar_sistema"]
    },
    {
      "nombre": "Cliente",
      "descripcion": "Acceso de solo lectura a sus propios datos",
      "permisos": ["ver_dashboard_propio", "crear_ticket_soporte"]
    }
  ]
}