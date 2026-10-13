using LagStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LagStore.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Supplier> Suppliers => Set<Supplier>();
        public DbSet<DeliveryMethod> DeliveryMethods => Set<DeliveryMethod>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<DeliveryMethod>()
                .Property(d => d.Price)
                .HasPrecision(18, 2);
        }
    }
}