using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class DeliveryMethodSaveDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(0, 10000)]
        public decimal Price { get; set; }

        [Range(0, 365)]
        public int EstimatedDaysMin { get; set; }

        [Range(0, 365)]
        public int EstimatedDaysMax { get; set; }
    }
}