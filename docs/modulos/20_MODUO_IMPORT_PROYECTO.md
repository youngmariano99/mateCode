📝 Parte 1: El Formulario Bidireccional
Para que no tengas que tipear todo a mano, vamos a hacer que el formulario sea de "ida y vuelta".

Exportar Preguntas: Un botón te copia un prompt al portapapeles tipo: "Tengo esta idea: [Tu Pitch]. Actúa como Product Manager y respóndeme este cuestionario para definir el proyecto: 1. ¿Cuáles son los módulos? 2. ¿Flujos críticos?..."

Importar Respuestas (Parseo): Pegás la respuesta de la IA en una caja de texto grande dentro de MateCode. El frontend toma ese texto y, usando un pequeño algoritmo o expresiones regulares, extrae las respuestas y rellena automáticamente los inputs de tu formulario.

Revisión: Vos leés lo que llenó la IA, modificás un par de palabras a mano, y pasás al siguiente paso.

🧠 Parte 2: El Mega-Prompt de Contexto
Una vez que el formulario está pulido, apretás "Generar Prompt de Arquitectura".

El sistema concatena todas tus respuestas en un solo bloque de texto súper estructurado.

Al final de ese bloque, el sistema le inyecta las instrucciones de salida modulares. Por ejemplo: "Ahora generaremos la estructura técnica. Debido a la longitud, te pediré los JSON por partes. Primero, devuélveme estrictamente un JSON con las tablas de la base de datos...".

🏭 Parte 3: "La Fábrica" (Staging Area & Ensamblaje Modular)
Esta es la pantalla más importante. Es tu mesa de trabajo antes de tocar la base de datos.

Inyección por Bloques: En lugar de un solo input para el "Mega JSON", tenés pestañas o secciones (Ej: [Inyectar JSON Base de Datos], [Inyectar JSON Backlog]). Podés ir a ChatGPT, pedirle la sección de BD, pegarla; luego pedirle el Backlog, y pegarlo.

Validación Estricta: Apenas pegás el JSON, el frontend usa una librería (como Zod) para verificarlo. Si la IA se olvidó una coma o mandó un campo mal tipado, la Fábrica te tira un error en rojo: "Falta el campo 'titulo' en la historia de usuario 3".

Edición Visual: Si el JSON es válido, no lo ves como código, lo ves como tarjetas en la pantalla. Podés:

Hacer clic en una tabla de la BD y cambiarle el nombre a una columna.

Borrar tickets de Kanban generados por la IA que no tienen sentido.

Crear manualmente una historia de usuario nueva desde cero ahí mismo.

🚀 Parte 4: Despliegue Atómico (El Botón Rojo)
Cuando La Fábrica tiene el proyecto exactamente como lo querés, llega el momento de la verdad.

Pantalla de Carga: Al darle a "Importar Proyecto", la interfaz entra en un modo inmersivo de "Desplegando Arquitectura..." con una barra de progreso que lee el estado de la conexión.

Transacción Atómica (Todo o Nada): Para cumplir tu regla de oro, esto se resuelve puramente en el backend. En tu API de .NET 8 vas a abrir una transacción de base de datos contra PostgreSQL antes de insertar el primer dato.

C#
// Ejemplo de la lógica en .NET con Entity Framework Core
using var transaction = await _context.Database.BeginTransactionAsync();
try 
{
    await InsertarProyecto(datos);
    await InsertarHistoriasUsuario(datos);
    await InsertarTablasERD(datos);
    await InsertarTickets(datos);
    
    // Si llegó hasta acá sin explotar, guarda todo de una vez.
    await transaction.CommitAsync(); 
}
catch (Exception) 
{
    // Si falla cualquier cosa (ej. un ticket vino mal), borra todo lo que hizo en este intento.
    await transaction.RollbackAsync();
    throw; 
}