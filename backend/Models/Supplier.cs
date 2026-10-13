namespace LagStore.Api.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public string ContactEmail { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }

        public List<Product> Products { get; set; } = new();
    }
}
