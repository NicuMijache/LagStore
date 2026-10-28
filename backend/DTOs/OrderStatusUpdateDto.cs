using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class OrderStatusUpdateDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
