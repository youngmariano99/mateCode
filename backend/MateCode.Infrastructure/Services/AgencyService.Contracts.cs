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

        public async Task<ContratoAgencia> CreateContractAsync(Guid agencyId, Guid clienteId, string titulo, string contenido, string estado)
        {
            var contract = new ContratoAgencia
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                ClienteId = clienteId,
                Titulo = titulo,
                Contenido = contenido,
                Estado = estado,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.ContratosAgencia.AddAsync(contract);
            await _context.SaveChangesAsync();

            // Cargar datos de relación de cliente para el objeto de respuesta
            await _context.Entry(contract).Reference(c => c.Cliente).LoadAsync();

            return contract;
        }

        public async Task<bool> UpdateContractAsync(Guid contractId, string titulo, string contenido, string estado)
        {
            var contract = await _context.ContratosAgencia.FindAsync(contractId);
            if (contract == null) return false;

            contract.Titulo = titulo;
            contract.Contenido = contenido;
            contract.Estado = estado;

            return await _context.SaveChangesAsync() > 0;
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
