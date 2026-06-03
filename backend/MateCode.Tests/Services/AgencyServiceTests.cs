using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;
using MateCode.Core.Entities;
using MateCode.Core.Exceptions;
using MateCode.Infrastructure.Persistence;
using MateCode.Infrastructure.Services;
using MateCode.Application.Services;

namespace MateCode.Tests.Services
{
    public class AgencyServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly IEncryptionUtility _mockEncryption;
        private readonly AgencyService _sut;

        public AgencyServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockEncryption = Substitute.For<IEncryptionUtility>();
            
            _mockEncryption.GenerateRandomKey().Returns("agency_plain_key");
            _mockEncryption.EncryptAgencyKey("agency_plain_key").Returns("agency_encrypted_key");

            _sut = new AgencyService(_context, _mockEncryption);
        }

        [Fact]
        public async Task CreateAgencyAsync_ShouldCreateAgencyAndAddOwnerAsMember()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var name = "Agencia Creativa Digital";

            // Act
            var agency = await _sut.CreateAgencyAsync(name, ownerId);

            // Assert
            Assert.NotNull(agency);
            Assert.Equal(name, agency.Nombre);
            Assert.Equal(ownerId, agency.PropietarioId);
            Assert.Equal("agencia", agency.Tipo);
            Assert.Equal("agency_encrypted_key", agency.LlaveCifrado);

            // Verify in DB
            var dbAgency = await _context.Agencias.FindAsync(agency.Id);
            Assert.NotNull(dbAgency);

            var dbMember = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.AgenciaId == agency.Id && m.UsuarioId == ownerId);
            Assert.NotNull(dbMember);
            Assert.Equal("Propietario", dbMember.Rol);
            Assert.Equal("Aceptada", dbMember.EstadoInvitacion);
        }

        [Fact]
        public async Task InviteMemberToAgencyAsync_WhenUserExists_ShouldCreatePendingMember()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var memberUserId = Guid.NewGuid();
            var agency = await _sut.CreateAgencyAsync("Mi Agencia", ownerId);
            
            var userToInvite = new Usuario
            {
                Id = memberUserId,
                Email = "colaborador@matecode.io",
                NombreCompleto = "Juan Perez",
                FechaCreacion = DateTime.UtcNow
            };
            await _context.Usuarios.AddAsync(userToInvite);
            await _context.SaveChangesAsync();

            // Act
            var invited = await _sut.InviteMemberToAgencyAsync(agency.Id, "colaborador@matecode.io");

            // Assert
            Assert.True(invited);

            var dbMember = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.AgenciaId == agency.Id && m.UsuarioId == memberUserId);
            Assert.NotNull(dbMember);
            Assert.Equal("Colaborador", dbMember.Rol);
            Assert.Equal("Pendiente", dbMember.EstadoInvitacion);
        }

        [Fact]
        public async Task InviteMemberToAgencyAsync_WhenUserDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var agency = await _sut.CreateAgencyAsync("Mi Agencia", ownerId);

            // Act
            var invited = await _sut.InviteMemberToAgencyAsync(agency.Id, "nonexistent@matecode.io");

            // Assert
            Assert.False(invited);
        }

        [Fact]
        public async Task AcceptInvitationAsync_ShouldChangeStatusToAceptada()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var memberUserId = Guid.NewGuid();
            var agency = await _sut.CreateAgencyAsync("Mi Agencia", ownerId);
            
            var user = new Usuario { Id = memberUserId, Email = "test@test.com", NombreCompleto = "Tester" };
            await _context.Usuarios.AddAsync(user);
            
            var permissions = JsonSerializer.Deserialize<JsonElement>("{}");
            await _sut.AddMemberToAgencyAsync(agency.Id, memberUserId, "Colaborador", permissions);

            // Act
            var accepted = await _sut.AcceptInvitationAsync(memberUserId, agency.Id);

            // Assert
            Assert.True(accepted);
            var member = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.UsuarioId == memberUserId && m.AgenciaId == agency.Id);
            Assert.NotNull(member);
            Assert.Equal("Aceptada", member.EstadoInvitacion);
        }

        [Fact]
        public async Task UpdateMemberPermissionsAsync_ShouldUpdateRoleAndPermissions()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var memberUserId = Guid.NewGuid();
            var agency = await _sut.CreateAgencyAsync("Mi Agencia", ownerId);
            
            var user = new Usuario { Id = memberUserId, Email = "test@test.com", NombreCompleto = "Tester" };
            await _context.Usuarios.AddAsync(user);
            await _sut.AddMemberToAgencyAsync(agency.Id, memberUserId, "Colaborador", JsonSerializer.Deserialize<JsonElement>("{}"));

            var newPerms = JsonSerializer.Deserialize<JsonElement>("{\"crm\":\"write\"}");

            // Act
            var updated = await _sut.UpdateMemberPermissionsAsync(agency.Id, memberUserId, "Administrador", newPerms);

            // Assert
            Assert.True(updated);
            var member = await _context.MiembrosAgencia
                .FirstOrDefaultAsync(m => m.UsuarioId == memberUserId && m.AgenciaId == agency.Id);
            Assert.NotNull(member);
            Assert.Equal("Administrador", member.Rol);
            Assert.Equal("write", member.PermisosJson.GetProperty("crm").GetString());
        }

        [Fact]
        public async Task CreateAndUpdateAndFavoriteResource_ShouldPersistCorrectly()
        {
            // Arrange
            var agencyId = Guid.NewGuid();
            var creatorId = Guid.NewGuid();
            var etiquetas = JsonSerializer.Deserialize<JsonElement>("[\"marketing\"]");
            var roles = JsonSerializer.Deserialize<JsonElement>("[]");

            // Act: Create
            var resource = await _sut.CreateResourceAsync(agencyId, creatorId, "Prompt Test", "Contenido del prompt", "prompt", etiquetas, roles, "Marketing");

            // Assert: Create
            Assert.NotNull(resource);
            Assert.Equal("Prompt Test", resource.Titulo);
            Assert.Equal("Marketing", resource.Categoria);
            Assert.False(resource.Favorito);

            // Act: Update
            var updated = await _sut.UpdateResourceAsync(resource.Id, "Prompt Test Modificado", "Contenido", "prompt", etiquetas, roles, "Desarrollo", true);
            
            // Assert: Update
            Assert.True(updated);
            var dbResource = await _context.Recursos.FindAsync(resource.Id);
            Assert.NotNull(dbResource);
            Assert.Equal("Prompt Test Modificado", dbResource.Titulo);
            Assert.Equal("Desarrollo", dbResource.Categoria);
            Assert.True(dbResource.Favorito);

            // Act: Toggle Favorite
            var toggled = await _sut.ToggleResourceFavoriteAsync(resource.Id, false);

            // Assert: Toggle Favorite
            Assert.True(toggled);
            dbResource = await _context.Recursos.FindAsync(resource.Id);
            Assert.NotNull(dbResource);
            Assert.False(dbResource.Favorito);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
