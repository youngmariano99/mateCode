using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MateCode.Core.Entities;

namespace MateCode.Infrastructure.Services
{
    public partial class AgencyService
    {
        public async Task<IEnumerable<ContratoAgencia>> GetContractsAsync(Guid agencyId)
        {
            return await _context.ContratosAgencia
                .Include(c => c.Cliente)
                .Where(c => c.AgenciaId == agencyId)
                .OrderByDescending(c => c.FechaCreacion)
                .ToListAsync();
        }

        public async Task<ContratoAgencia?> GetContractByIdAsync(Guid contractId, Guid agencyId)
        {
            return await _context.ContratosAgencia
                .Include(c => c.Cliente)
                .FirstOrDefaultAsync(c => c.Id == contractId && c.AgenciaId == agencyId);
        }

        public async Task<ContratoAgencia> CreateContractAsync(Guid agencyId, Guid? clienteId, string titulo, string contenido, string estado, System.Text.Json.JsonElement miembrosIds)
        {
            return await CreateContractAsync(agencyId, clienteId, titulo, contenido, estado, "Cliente", miembrosIds);
        }

        public async Task<ContratoAgencia> CreateContractAsync(Guid agencyId, Guid? clienteId, string titulo, string contenido, string estado, string tipoContrato, System.Text.Json.JsonElement miembrosIds)
        {
            if (miembrosIds.ValueKind == System.Text.Json.JsonValueKind.Undefined)
            {
                miembrosIds = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>("[]");
            }

            var contract = new ContratoAgencia
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                ClienteId = clienteId,
                Titulo = titulo,
                Contenido = contenido,
                Estado = estado,
                TipoContrato = tipoContrato,
                MiembrosIds = miembrosIds,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.ContratosAgencia.AddAsync(contract);
            await _context.SaveChangesAsync();

            if (clienteId.HasValue)
            {
                await _context.Entry(contract).Reference(c => c.Cliente).LoadAsync();
            }

            return contract;
        }

        public async Task<bool> UpdateContractAsync(Guid contractId, string titulo, string contenido, string estado, Guid userId, string userName)
        {
            var contract = await _context.ContratosAgencia.FindAsync(contractId);
            if (contract == null) return false;

            if (contract.Contenido != contenido || contract.Titulo != titulo)
            {
                var history = new ContratoHistorial
                {
                    Id = Guid.NewGuid(),
                    ContratoId = contract.Id,
                    UsuarioId = userId,
                    NombreUsuario = userName,
                    ContenidoAnterior = $"Título: {contract.Titulo}\n\n{contract.Contenido}",
                    ContenidoNuevo = $"Título: {titulo}\n\n{contenido}",
                    FechaCambio = DateTime.UtcNow
                };
                await _context.ContratosHistorial.AddAsync(history);
            }

            contract.Titulo = titulo;
            contract.Contenido = contenido;
            contract.Estado = estado;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateContractAsync(Guid contractId, string titulo, string contenido, string estado)
        {
            return await UpdateContractAsync(contractId, titulo, contenido, estado, Guid.Empty, "Sistema");
        }

        public async Task<IEnumerable<ContratoHistorial>> GetContractHistoryAsync(Guid contractId)
        {
            return await _context.ContratosHistorial
                .Where(h => h.ContratoId == contractId)
                .OrderByDescending(h => h.FechaCambio)
                .ToListAsync();
        }

        public async Task<bool> DeleteContractAsync(Guid contractId)
        {
            var contract = await _context.ContratosAgencia.FindAsync(contractId);
            if (contract == null) return false;

            _context.ContratosAgencia.Remove(contract);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SignContractAsync(Guid contractId, DateTime fechaFirma, string huellaCriptografica)
        {
            var contract = await _context.ContratosAgencia.FindAsync(contractId);
            if (contract == null) return false;

            contract.Estado = "Firmado";
            contract.FechaFirma = fechaFirma;
            contract.HuellaCriptografica = huellaCriptografica;

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
