using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class CategorySaveDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}