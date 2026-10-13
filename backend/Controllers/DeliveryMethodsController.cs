using LagStore.Api.Data;
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
        public async Task<ActionResult<List<DeliveryMethod>>> GetAll()
        {
            return await _db.DeliveryMethods.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DeliveryMethod>> GetById(int id)
        {
            var method = await _db.DeliveryMethods.FindAsync(id);
            if (method == null) return NotFound();
            return method;
        }

        [HttpPost]
        public async Task<ActionResult<DeliveryMethod>> Create(DeliveryMethod method)
        {
            _db.DeliveryMethods.Add(method);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = method.Id }, method);
        }
    }
}