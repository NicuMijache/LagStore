using LagStore.Api.Data;
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
        public async Task<ActionResult<List<Supplier>>> GetAll()
        {
            return await _db.Suppliers.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> GetById(int id)
        {
            var supplier = await _db.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();
            return supplier;
        }

        [HttpPost]
        public async Task<ActionResult<Supplier>> Create(Supplier supplier)
        {
            _db.Suppliers.Add(supplier);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Supplier input)
        {
            var supplier = await _db.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            supplier.Name = input.Name;
            supplier.ContactEmail = input.ContactEmail;
            supplier.ContactPhone = input.ContactPhone;
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