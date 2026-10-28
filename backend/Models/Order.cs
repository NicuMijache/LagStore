namespace LagStore.Api.Models
{
    public enum OrderStatus
    {
        Plasata,
        InProcesare,
        Expediata,
        Livrata,
        Anulata
    }

    public class Order
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; set; } = OrderStatus.Plasata;

        // Datele clientului pentru livrare
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string County { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // Snapshot al metodei de livrare din momentul comenzii
        public string DeliveryMethodName { get; set; } = string.Empty;
        public decimal DeliveryPrice { get; set; }

        public decimal ItemsTotal { get; set; }
        public decimal Total { get; set; }

        public List<OrderItem> Items { get; set; } = new();
    }
}
