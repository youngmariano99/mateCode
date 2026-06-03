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
        public async Task<object> GetFinanceDashboardAsync(Guid agencyId)
        {
            var txs = await _context.TransaccionesAgencia
                .Where(t => t.AgenciaId == agencyId)
                .OrderByDescending(t => t.Fecha)
                .ToListAsync();

            decimal ingresos = txs.Where(t => t.Tipo == "ingreso").Sum(t => t.Monto);
            decimal egresos = txs.Where(t => t.Tipo == "egreso" || t.Tipo == "costo_fijo" || t.Tipo == "costo_variable").Sum(t => t.Monto);
            decimal fijos = txs.Where(t => t.Tipo == "costo_fijo").Sum(t => t.Monto);
            decimal variables = txs.Where(t => t.Tipo == "costo_variable").Sum(t => t.Monto);

            var distribucion = txs
                .Where(t => !string.IsNullOrEmpty(t.Categoria))
                .GroupBy(t => t.Categoria)
                .Select(g => new { Categoria = g.Key, Total = g.Sum(t => t.Monto) })
                .ToDictionary(k => k.Categoria!, v => v.Total);

            return new
            {
                totalIngresos = ingresos,
                totalEgresos = egresos,
                totalCostosFijos = fijos,
                totalCostosVariables = variables,
                balanceNeto = ingresos - egresos,
                transacciones = txs.Take(50),
                distribucionCategorias = distribucion
            };
        }

        public async Task<TransaccionAgencia> CreateTransactionAsync(Guid agencyId, string tipo, decimal monto, string concepto, string descripcion, DateTime fecha, string categoria, Guid? proyectoId)
        {
            var tx = new TransaccionAgencia
            {
                Id = Guid.NewGuid(),
                AgenciaId = agencyId,
                Tipo = tipo,
                Monto = monto,
                Concepto = concepto,
                Descripcion = descripcion,
                Fecha = fecha,
                Categoria = categoria,
                ProyectoId = proyectoId,
                FechaCreacion = DateTime.UtcNow
            };

            await _context.TransaccionesAgencia.AddAsync(tx);
            await _context.SaveChangesAsync();
            return tx;
        }

        public async Task<bool> DeleteTransactionAsync(Guid transactionId)
        {
            var tx = await _context.TransaccionesAgencia.FindAsync(transactionId);
            if (tx == null) return false;

            _context.TransaccionesAgencia.Remove(tx);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
