# Guía de Procedimiento: Desarrollar Nuevo Endpoint en .NET

Esta guía procedural detalla el paso a paso enfocado a objetivos para crear un nuevo endpoint en el backend de .NET 8/9 bajo Clean Architecture, respetando RLS y asincronía.

---

## 1. Modificación de la Capa Core (Dominio)
*Si la tarea requiere una nueva entidad o constante de negocio:*
1.  Dirigite a `MateCode.Core/Entities/`.
2.  Creá tu entidad (en PascalCase y variables en Español).
3.  Asegurá que cuente con las propiedades de borrado lógico e inquilino si aplica (`tenant_id`, `is_deleted`).

---

## 2. Modificación de la Capa Application (Casos de Uso)
1.  **Definir el Contrato:** En `MateCode.Application/Services/`, creá o modificá la interfaz de tu servicio utilizando firmas exclusivamente asíncronas:
    ```csharp
    public interface IClienteService
    {
        Task<ClienteDto> RegistrarClienteAsync(CrearClienteCommand command, Guid tenantId);
    }
    ```
2.  **Definir los DTOs:** Creá las clases de transferencia de datos necesarias dentro de `MateCode.Application/Dtos/`.
3.  **Implementar la Lógica:** Implementá la interfaz de tu servicio en `MateCode.Application/Services/Impl/` asegurando el retorno temprano mediante Cláusulas de Guarda:
    ```csharp
    public async Task<ClienteDto> RegistrarClienteAsync(CrearClienteCommand command, Guid tenantId)
    {
        if (string.IsNullOrWhiteSpace(command.Nombre))
            throw new ValidacionException("El nombre del cliente es obligatorio.");

        // Lógica de negocio aquí...
    }
    ```

---

## 3. Modificación de la Capa Infrastructure (Persistencia)
1.  Si se utiliza Entity Framework Core, registrá la entidad en `MateCode.Infrastructure/Persistence/AppDbContext.cs` como `DbSet<T>`.
2.  Configurá los filtros globales de consulta en el método `OnModelCreating` de EF para que intercepten el `tenant_id` y filtren los elementos borrados lógicamente (`is_deleted == false`).
3.  Implementá los repositorios específicos si no utilizás el repositorio genérico.

---

## 4. Modificación de la Capa API (Controladores)
1.  Dirigite a `MateCode.API/Controllers/`.
2.  Creá tu controlador heredando de `BaseApiController`.
3.  Inyectá el servicio correspondiente a través del constructor.
4.  Expón tu endpoint asíncrono mapeando el contexto de seguridad del inquilino (obtenido a través de los claims del token en `HttpContext.Items["TenantId"]`):
    ```csharp
    [HttpPost]
    public async Task<IActionResult> RegistrarCliente([FromBody] CrearClienteDto request)
    {
        var tenantId = (Guid)HttpContext.Items["TenantId"];
        var resultado = await _clienteService.RegistrarClienteAsync(request, tenantId);
        return Ok(resultado);
    }
    ```
