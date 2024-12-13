using CarAndAll_ASPReact.Server;
using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]

public class VerhuuraanvragenController : ControllerBase
{
    private readonly CarAndAllDbContext _context;

    public VerhuuraanvragenController(CarAndAllDbContext context)
    {
        _context = context;
    }

    [HttpGet("voertuigen/{voertuigId}")]
    public IActionResult GetVerhuurAanvragenVoorVoertuig(int voertuigId)
    {
        var verhuuraanvragen = _context.Verhuuraanvragen
            .Where(va => va.VoertuigId == voertuigId && va.Status == "Goedgekeurd")
            .Select(va => new { va.Startdatum, va.Einddatum })
            .ToList();

        return Ok(verhuuraanvragen);
    }

}
