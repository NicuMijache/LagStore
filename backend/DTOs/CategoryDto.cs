using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}