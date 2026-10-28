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
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _db;

        public WishlistController(AppDbContext db)
        {
            _db = db;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<ActionResult<List<WishlistItemDto>>> GetAll()
        {
            return await _db.WishlistItems
                .Where(w => w.UserId == UserId)
                .OrderByDescending(w => w.AddedAt)
                .Select(w => new WishlistItemDto
                {
                    Id = w.Product.Id,
                    Name = w.Product.Name,
                    Description = w.Product.Description,
                    Specifications = w.Product.Specifications,
                    Price = w.Product.Price,
                    Stock = w.Product.Stock,
                    CategoryId = w.Product.CategoryId,
                    CategoryName = w.Product.Category.Name,
                    SupplierId = w.Product.SupplierId,
                    SupplierName = w.Product.Supplier.Name,
                    DeliveryMethodId = w.Product.DeliveryMethodId,
                    DeliveryMethodName = w.Product.DeliveryMethod.Name,
                    DeliveryPrice = w.Product.DeliveryMethod.Price,
                    EstimatedDaysMin = w.Product.DeliveryMethod.EstimatedDaysMin,
                    EstimatedDaysMax = w.Product.DeliveryMethod.EstimatedDaysMax,
                    AddedAt = w.AddedAt
                })
                .ToListAsync();
        }

        [HttpPost("{productId}")]
        public async Task<IActionResult> Add(int productId)
        {
            if (!await _db.Products.AnyAsync(p => p.Id == productId))
                return NotFound("Produsul nu există.");

            if (await _db.WishlistItems.AnyAsync(w => w.UserId == UserId && w.ProductId == productId))
                return Ok();

            _db.WishlistItems.Add(new WishlistItem { UserId = UserId, ProductId = productId });
            await _db.SaveChangesAsync();
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> Remove(int productId)
        {
            var item = await _db.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == UserId && w.ProductId == productId);

            if (item != null)
            {
                _db.WishlistItems.Remove(item);
                await _db.SaveChangesAsync();
            }
            return NoContent();
        }
    }
}
