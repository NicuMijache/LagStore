using System.Linq.Expressions;
using System.Security.Claims;
using LagStore.Api.Data;
using LagStore.Api.DTOs;
using LagStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LagStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public OrdersController(AppDbContext db)
        {
            _db = db;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        private static readonly Expression<Func<Order, OrderDto>> ToDto = o => new OrderDto
        {
            Id = o.Id,
            CreatedAt = o.CreatedAt,
            Status = o.Status.ToString(),
            CustomerEmail = o.User.Email ?? string.Empty,
            FullName = o.FullName,
            Phone = o.Phone,
            Address = o.Address,
            City = o.City,
            County = o.County,
            PostalCode = o.PostalCode,
            Notes = o.Notes,
            DeliveryMethodName = o.DeliveryMethodName,
            DeliveryPrice = o.DeliveryPrice,
            ItemsTotal = o.ItemsTotal,
            Total = o.Total,
            ItemCount = o.Items.Sum(i => i.Quantity),
            Items = o.Items
                .OrderBy(i => i.Id)
                .Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    Subtotal = i.UnitPrice * i.Quantity
                })
                .ToList()
        };

        [HttpPost]
        public async Task<ActionResult<OrderDto>> Checkout(CheckoutDto dto)
        {
            var delivery = await _db.DeliveryMethods.FindAsync(dto.DeliveryMethodId);
            if (delivery == null)
                return BadRequest("Metoda de livrare aleasă nu există.");

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var cart = await _db.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == UserId)
                .OrderBy(c => c.Id)
                .ToListAsync();

            if (cart.Count == 0)
                return BadRequest("Coșul este gol.");

            foreach (var line in cart)
            {
                // Scădere atomică: reușește doar dacă stocul încă ajunge (protejează de comenzi simultane)
                var updated = await _db.Products
                    .Where(p => p.Id == line.ProductId && p.Stock >= line.Quantity)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - line.Quantity));

                if (updated == 0)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Stoc insuficient pentru „{line.Product.Name}”: mai sunt doar {line.Product.Stock} bucăți disponibile.");
                }
            }

            // Prețurile și totalurile se calculează pe server, din baza de date
            var items = cart.Select(c => new OrderItem
            {
                ProductId = c.ProductId,
                ProductName = c.Product.Name,
                UnitPrice = c.Product.Price,
                Quantity = c.Quantity
            }).ToList();

            var itemsTotal = items.Sum(i => i.UnitPrice * i.Quantity);

            var order = new Order
            {
                UserId = UserId,
                FullName = dto.FullName.Trim(),
                Phone = dto.Phone.Trim(),
                Address = dto.Address.Trim(),
                City = dto.City.Trim(),
                County = dto.County.Trim(),
                PostalCode = dto.PostalCode.Trim(),
                Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
                DeliveryMethodName = delivery.Name,
                DeliveryPrice = delivery.Price,
                ItemsTotal = itemsTotal,
                Total = itemsTotal + delivery.Price,
                Items = items
            };

            _db.Orders.Add(order);
            _db.CartItems.RemoveRange(cart);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var created = await _db.Orders.Where(o => o.Id == order.Id).Select(ToDto).FirstAsync();
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, created);
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetMine()
        {
            return await _db.Orders
                .Where(o => o.UserId == UserId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(ToDto)
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetById(int id)
        {
            var query = _db.Orders.Where(o => o.Id == id);
            if (!User.IsInRole("Admin"))
                query = query.Where(o => o.UserId == UserId);

            var order = await query.Select(ToDto).FirstOrDefaultAsync();
            if (order == null) return NotFound();
            return order;
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<OrderDto>>> GetAll()
        {
            return await _db.Orders
                .OrderByDescending(o => o.CreatedAt)
                .Select(ToDto)
                .ToListAsync();
        }

        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, OrderStatusUpdateDto dto)
        {
            if (!Enum.GetNames<OrderStatus>().Contains(dto.Status))
                return BadRequest($"Stare invalidă. Valori permise: {string.Join(", ", Enum.GetNames<OrderStatus>())}.");

            var newStatus = Enum.Parse<OrderStatus>(dto.Status);

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            if (order.Status == newStatus) return NoContent();

            if (order.Status == OrderStatus.Anulata)
                return BadRequest("Comanda este anulată și nu mai poate fi modificată.");

            // La anulare, produsele care încă există își recapătă stocul
            if (newStatus == OrderStatus.Anulata)
            {
                foreach (var item in order.Items.Where(i => i.ProductId != null))
                {
                    await _db.Products
                        .Where(p => p.Id == item.ProductId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock + item.Quantity));
                }
            }

            order.Status = newStatus;
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            return NoContent();
        }
    }
}
