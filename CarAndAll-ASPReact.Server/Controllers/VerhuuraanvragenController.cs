using CarAndAll_ASPReact.Server;
using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CarAndAll_ASPReact.Server.DTOs;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
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
    [HttpPost]
    public async Task<IActionResult> CreateVerhuuraanvraag([FromBody] VerhuuraanvraagDto verhuuraanvraagDto)
    {
        try
        {
            var huurderId = "asdasd";  // Dit zou moeten komen uit de claims van de ingelogde gebruiker.
            Console.WriteLine(huurderId);

            if (string.IsNullOrEmpty(huurderId))
            {
                return Unauthorized(new { message = "Geen geldige gebruiker gevonden." });
            }

            if (verhuuraanvraagDto.Startdatum >= verhuuraanvraagDto.Einddatum)
            {
                return BadRequest(new { message = "De startdatum moet eerder zijn dan de einddatum." });
            }

            var nieuweAanvraag = new Verhuuraanvraag
            {
                Startdatum = verhuuraanvraagDto.Startdatum,
                Einddatum = verhuuraanvraagDto.Einddatum,
                Status = "In behandeling",
                HuurderId = huurderId,
                VoertuigId = verhuuraanvraagDto.VoertuigId
            };

            // Voeg de nieuwe aanvraag toe aan de database
            _context.Verhuuraanvragen.Add(nieuweAanvraag);

            // Sla de wijzigingen op in de database
            await _context.SaveChangesAsync();
            Console.WriteLine("SAVED YOUR LIL ASS DIDDY");

            // Retourneer een CreatedAtAction response met de nieuwe aanvraag
            return CreatedAtAction(nameof(GetVerhuurAanvragenVoorVoertuig), new { voertuigId = nieuweAanvraag.VoertuigId }, nieuweAanvraag);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");

            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                Console.WriteLine($"Inner Exception StackTrace: {ex.InnerException.StackTrace}");
            }

            return StatusCode(500, new { message = "Er is iets misgegaan bij het verwerken van de aanvraag." });
        }
    }

}


/*
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

}*/
