using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class ProductSaveDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public string Specifications { get; set; } = string.Empty;

        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        [Range(0, 100000)]
        public int Stock { get; set; }

        public int CategoryId { get; set; }
        public int SupplierId { get; set; }
        public int DeliveryMethodId { get; set; }
    }
}