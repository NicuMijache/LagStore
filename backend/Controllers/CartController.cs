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
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CartController(AppDbContext db)
        {
            _db = db;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        private static string StockMessage(string productName, int stock)
        {
            return stock == 0
                ? $"Produsul „{productName}” nu mai este în stoc."
                : $"Stoc insuficient pentru „{productName}”: mai sunt doar {stock} bucăți disponibile.";
        }

        [HttpGet]
        public async Task<ActionResult<CartDto>> Get()
        {
            var items = await _db.CartItems
                .Where(c => c.UserId == UserId)
                .OrderBy(c => c.Id)
                .Select(c => new CartItemDto
                {
                    ProductId = c.ProductId,
                    ProductName = c.Product.Name,
                    CategoryName = c.Product.Category.Name,
                    UnitPrice = c.Product.Price,
                    Quantity = c.Quantity,
                    Stock = c.Product.Stock,
                    Subtotal = c.Product.Price * c.Quantity
                })
                .ToListAsync();

            return new CartDto
            {
                Items = items,
                ItemCount = items.Sum(i => i.Quantity),
                Total = items.Sum(i => i.Subtotal)
            };
        }

        [HttpPost]
        public async Task<IActionResult> Add(CartAddDto dto)
        {
            var product = await _db.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Produsul nu există.");

            var item = await _db.CartItems
                .FirstOrDefaultAsync(c => c.UserId == UserId && c.ProductId == dto.ProductId);

            var newQuantity = (item?.Quantity ?? 0) + dto.Quantity;
            if (newQuantity > product.Stock)
                return BadRequest(StockMessage(product.Name, product.Stock));

            if (item == null)
                _db.CartItems.Add(new CartItem { UserId = UserId, ProductId = dto.ProductId, Quantity = newQuantity });
            else
                item.Quantity = newQuantity;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{productId}")]
        public async Task<IActionResult> Update(int productId, CartUpdateDto dto)
        {
            var item = await _db.CartItems
                .Include(c => c.Product)
                .FirstOrDefaultAsync(c => c.UserId == UserId && c.ProductId == productId);
            if (item == null) return NotFound("Produsul nu este în coș.");

            if (dto.Quantity > item.Product.Stock)
                return BadRequest(StockMessage(item.Product.Name, item.Product.Stock));

            item.Quantity = dto.Quantity;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> Remove(int productId)
        {
            var item = await _db.CartItems
                .FirstOrDefaultAsync(c => c.UserId == UserId && c.ProductId == productId);

            if (item != null)
            {
                _db.CartItems.Remove(item);
                await _db.SaveChangesAsync();
            }
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> Clear()
        {
            await _db.CartItems.Where(c => c.UserId == UserId).ExecuteDeleteAsync();
            return NoContent();
        }
    }
}
