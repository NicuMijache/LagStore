namespace LagStore.Api.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string County { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string? Notes { get; set; }

        public string DeliveryMethodName { get; set; } = string.Empty;
        public decimal DeliveryPrice { get; set; }
        public decimal ItemsTotal { get; set; }
        public decimal Total { get; set; }
        public int ItemCount { get; set; }

        public List<OrderItemDto> Items { get; set; } = new();
    }
}
