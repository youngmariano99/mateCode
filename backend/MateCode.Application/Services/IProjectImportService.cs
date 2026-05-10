using System;
using System.Threading.Tasks;
using MateCode.Application.Dtos;

namespace MateCode.Application.Services
{
    public interface IProjectImportService
    {
        Task<bool> ImportProjectDataAsync(ProjectImportRequestDto request);
    }
}
