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
    }
}