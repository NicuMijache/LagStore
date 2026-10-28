using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class CartUpdateDto
    {
        [Range(1, 100000)]
        public int Quantity { get; set; }
    }
}
