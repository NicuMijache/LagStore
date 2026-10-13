namespace LagStore.Api.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Specifications { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }

        public int SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;

        public int DeliveryMethodId { get; set; }
        public DeliveryMethod DeliveryMethod { get; set; } = null!;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}