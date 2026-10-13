namespace LagStore.Api.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Specifications { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;

        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;

        public int DeliveryMethodId { get; set; }
        public string DeliveryMethodName { get; set; } = string.Empty;
        public decimal DeliveryPrice { get; set; }
        public int EstimatedDaysMin { get; set; }
        public int EstimatedDaysMax { get; set; }
    }
}