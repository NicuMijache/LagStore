using LagStore.Api.Data;
using LagStore.Api.DTOs;
using LagStore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LagStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SuppliersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<SupplierDto>>> GetAll()
        {
            return await _db.Suppliers
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    ContactEmail = s.ContactEmail,
                    ContactPhone = s.ContactPhone
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierDto>> GetById(int id)
        {
            var supplier = await _db.Suppliers
                .Where(s => s.Id == id)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    ContactEmail = s.ContactEmail,
                    ContactPhone = s.ContactPhone
                })
                .FirstOrDefaultAsync();

            if (supplier == null) return NotFound();
            return supplier;
        }

        [HttpPost]
        public async Task<ActionResult<SupplierDto>> Create(SupplierDto dto)
        {
            var supplier = new Supplier
            {
                Name = dto.Name,
                ContactEmail = dto.ContactEmail,
                ContactPhone = dto.ContactPhone
            };
            _db.Suppliers.Add(supplier);
            await _db.SaveChangesAsync();

            dto.Id = supplier.Id;
            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, SupplierDto dto)
        {
            var supplier = await _db.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            supplier.Name = dto.Name;
            supplier.ContactEmail = dto.ContactEmail;
            supplier.ContactPhone = dto.ContactPhone;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _db.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            if (await _db.Products.AnyAsync(p => p.SupplierId == id))
                return Conflict("Furnizorul are produse și nu poate fi șters.");

            _db.Suppliers.Remove(supplier);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}