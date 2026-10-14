using LagStore.Api.Data;
using LagStore.Api.DTOs;
using LagStore.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LagStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveryMethodsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DeliveryMethodsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<DeliveryMethodDto>>> GetAll()
        {
            return await _db.DeliveryMethods
                .Select(d => new DeliveryMethodDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Price = d.Price,
                    EstimatedDaysMin = d.EstimatedDaysMin,
                    EstimatedDaysMax = d.EstimatedDaysMax
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DeliveryMethodDto>> GetById(int id)
        {
            var method = await _db.DeliveryMethods
                .Where(d => d.Id == id)
                .Select(d => new DeliveryMethodDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Price = d.Price,
                    EstimatedDaysMin = d.EstimatedDaysMin,
                    EstimatedDaysMax = d.EstimatedDaysMax
                })
                .FirstOrDefaultAsync();

            if (method == null) return NotFound();
            return method;
        }

        [HttpPost]
        public async Task<ActionResult<DeliveryMethodDto>> Create(DeliveryMethodSaveDto dto)
        {
            if (dto.EstimatedDaysMin > dto.EstimatedDaysMax)
                return BadRequest("Numărul minim de zile nu poate depăși maximul.");

            var method = new DeliveryMethod
            {
                Name = dto.Name,
                Price = dto.Price,
                EstimatedDaysMin = dto.EstimatedDaysMin,
                EstimatedDaysMax = dto.EstimatedDaysMax
            };
            _db.DeliveryMethods.Add(method);
            await _db.SaveChangesAsync();

            var result = new DeliveryMethodDto
            {
                Id = method.Id,
                Name = method.Name,
                Price = method.Price,
                EstimatedDaysMin = method.EstimatedDaysMin,
                EstimatedDaysMax = method.EstimatedDaysMax
            };
            return CreatedAtAction(nameof(GetById), new { id = method.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DeliveryMethodSaveDto dto)
        {
            var method = await _db.DeliveryMethods.FindAsync(id);
            if (method == null) return NotFound();

            if (dto.EstimatedDaysMin > dto.EstimatedDaysMax)
                return BadRequest("Numărul minim de zile nu poate depăși maximul.");

            method.Name = dto.Name;
            method.Price = dto.Price;
            method.EstimatedDaysMin = dto.EstimatedDaysMin;
            method.EstimatedDaysMax = dto.EstimatedDaysMax;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var method = await _db.DeliveryMethods.FindAsync(id);
            if (method == null) return NotFound();

            if (await _db.Products.AnyAsync(p => p.DeliveryMethodId == id))
                return Conflict("Metoda de livrare este folosită de produse și nu poate fi ștearsă.");

            _db.DeliveryMethods.Remove(method);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}