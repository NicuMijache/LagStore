using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class CartAddDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Range(1, 100000)]
        public int Quantity { get; set; } = 1;
    }
}
