namespace LagStore.Api.DTOs
{
    public class CartDto
    {
        public List<CartItemDto> Items { get; set; } = new();
        public int ItemCount { get; set; }
        public decimal Total { get; set; }
    }
}
