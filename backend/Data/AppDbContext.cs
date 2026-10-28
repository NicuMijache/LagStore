using LagStore.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace LagStore.Api.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Supplier> Suppliers => Set<Supplier>();
        public DbSet<DeliveryMethod> DeliveryMethods => Set<DeliveryMethod>();
        public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<DeliveryMethod>()
                .Property(d => d.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<WishlistItem>()
                .HasIndex(w => new { w.UserId, w.ProductId })
                .IsUnique();

            modelBuilder.Entity<CartItem>()
                .HasIndex(c => new { c.UserId, c.ProductId })
                .IsUnique();

            modelBuilder.Entity<Order>(order =>
            {
                order.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
                order.Property(o => o.DeliveryPrice).HasPrecision(18, 2);
                order.Property(o => o.ItemsTotal).HasPrecision(18, 2);
                order.Property(o => o.Total).HasPrecision(18, 2);
                order.HasIndex(o => new { o.UserId, o.CreatedAt });
            });

            modelBuilder.Entity<OrderItem>(item =>
            {
                item.Property(i => i.UnitPrice).HasPrecision(18, 2);
                item.HasOne(i => i.Product)
                    .WithMany()
                    .HasForeignKey(i => i.ProductId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}