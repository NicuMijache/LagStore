using System.ComponentModel.DataAnnotations;

namespace LagStore.Api.DTOs
{
    public class CheckoutDto
    {
        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, RegularExpression(@"^(\+40|0040|0)[237]\d{8}$", ErrorMessage = "Numărul de telefon nu este valid.")]
        public string Phone { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string County { get; set; } = string.Empty;

        [Required, RegularExpression(@"^\d{6}$", ErrorMessage = "Codul poștal trebuie să aibă 6 cifre.")]
        public string PostalCode { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Alege o metodă de livrare.")]
        public int DeliveryMethodId { get; set; }
    }
}
