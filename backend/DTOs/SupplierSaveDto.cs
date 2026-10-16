using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class SupplierSaveDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string ContactEmail { get; set; } = string.Empty;

        public string? ContactPhone { get; set; }
    }
}