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
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProductsController(AppDbContext db)
        {
            _db = db;
        }

        private static IQueryable<ProductDto> ToDto(IQueryable<Product> query)
        {
            return query.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Specifications = p.Specifications,
                Price = p.Price,
                Stock = p.Stock,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier.Name,
                DeliveryMethodId = p.DeliveryMethodId,
                DeliveryMethodName = p.DeliveryMethod.Name,
                DeliveryPrice = p.DeliveryMethod.Price,
                EstimatedDaysMin = p.DeliveryMethod.EstimatedDaysMin,
                EstimatedDaysMax = p.DeliveryMethod.EstimatedDaysMax
            });
        }

        private async Task<bool> ReferencesExist(ProductSaveDto dto)
        {
            return await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId)
                && await _db.Suppliers.AnyAsync(s => s.Id == dto.SupplierId)
                && await _db.DeliveryMethods.AnyAsync(d => d.Id == dto.DeliveryMethodId);
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductDto>>> GetAll(int? categoryId, string? search)
        {
            var query = _db.Products.AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.Contains(search));

            return await ToDto(query).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await ToDto(_db.Products.Where(p => p.Id == id)).FirstOrDefaultAsync();
            if (product == null) return NotFound();
            return product;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> Create(ProductSaveDto dto)
        {
            if (!await ReferencesExist(dto))
                return BadRequest("Categoria, furnizorul sau metoda de livrare nu există.");

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Specifications = dto.Specifications,
                Price = dto.Price,
                Stock = dto.Stock,
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,
                DeliveryMethodId = dto.DeliveryMethodId
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            var created = await ToDto(_db.Products.Where(p => p.Id == product.Id)).FirstAsync();
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, ProductSaveDto dto)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            if (!await ReferencesExist(dto))
                return BadRequest("Categoria, furnizorul sau metoda de livrare nu există.");

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Specifications = dto.Specifications;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.CategoryId = dto.CategoryId;
            product.SupplierId = dto.SupplierId;
            product.DeliveryMethodId = dto.DeliveryMethodId;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            _db.Products.Remove(product);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}