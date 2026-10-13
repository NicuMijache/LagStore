using LagStore.Api.Data;
using LagStore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LagStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CategoriesController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<Category>>> GetAll()
        {
            return await _db.Categories.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetById(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return NotFound();
            return category;
        }

        [HttpPost]
        public async Task<ActionResult<Category>> Create(Category category)
        {
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Category input)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return NotFound();

            category.Name = input.Name;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return NotFound();

            if (await _db.Products.AnyAsync(p => p.CategoryId == id))
                return Conflict("Categoria are produse și nu poate fi ștearsă.");

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
