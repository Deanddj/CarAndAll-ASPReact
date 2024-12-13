using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System;

namespace CarAndAll_ASPReact.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoertuigController : ControllerBase

    {
        private readonly CarAndAllDbContext _context;

        public VoertuigController(CarAndAllDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voertuig>>> GetVoertuigen()
        {
            var voertuigen = await _context.Voertuigen.ToListAsync();
            return Ok(voertuigen);
            Console.WriteLine("GETREQUEST");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVoertuig(int id)
        {
            var voertuig = await _context.Voertuigen
                .Include(v => v.Verhuuraanvragen)
                .FirstOrDefaultAsync(v => v.VoertuigId == id);

            if (voertuig == null)
            {
                // Return een lege object om te voorkomen dat de client een fout krijgt
                return NotFound(new { message = "Voertuig niet gevonden" });
            }

            return Ok(voertuig);
        }


    }
}